import { getCoreVersion, getVersion } from './internals'
import render from './render'
import { Logger, RenderApp, Server } from './types'
import { Page, safe, safeParse, throwError } from '@navigare/core'
import bodyParser from 'body-parser'
import chalk from 'chalk'
import compression from 'compression'
import express from 'express'
import fs from 'fs'
import getPort from 'get-port'
import path from 'path'
import { Manifest, ViteDevServer } from 'vite'

export interface Options {
  host: string
  port: number
  logger: Logger
  vite: ViteDevServer
}

export default async function (
  options: Partial<Options> = {
    port: Number(process.env.NAVIGARE_PORT),
  },
): Promise<Server> {
  const { logger, host = '0.0.0.0', port = 13715, vite } = options

  // Create express server
  const app = express()
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(compression())

  // Keep track of certain statistics
  const latestRequestedPages: {
    time: number
    page: Page
  }[] = []

  // Use vite's connect instance as middleware
  if (vite) {
    app.use(vite.middlewares)
  }

  // Define routes
  app.get('/', async (_request, response) => {
    response.send(`
      <form id="form" method="post" action="/render">
        <div>
          <textarea name="page" id="page" cols="120" rows="12"></textarea>
        </div>

        <button type="button" onclick="format()">Format</button>

        <button type="button" onclick="save()">Save</button>
      
        <button type="button" onclick="saveAndSubmit()">Submit</button>
      
        <ul>
          ${latestRequestedPages
            .map(({ time, page }) => {
              /*const components = Object.entries(page.fragments).map(([name, fragment]) => {
              return `${name}: ${isArray(fragment)}`
            }).join(', ');*/

              return `<li style="cursor: pointer;" onclick="page.value = atob('${Buffer.from(
                JSON.stringify(page, null, 2),
              ).toString('base64')}')">${new Date(time).toISOString()}: ${
                page.location.href
              }</li>`
            })
            .join('\n')}
        </ul>

        <script>
          const page = document.getElementById('page')

          const format = () => {
            try {
              const parsed = JSON.parse(page.value)
              
              page.value = JSON.stringify(parsed, null, 2)
            } catch (error) {
              // Do nothing
            }
          }

          const saveAndSubmit = () => {
            save()
            document.getElementById('form').submit()
          }

          const load = () => {
            page.value = window.localStorage.getItem('page')
          }

          const save = () => {
            window.localStorage.setItem('page', page.value)
          }

          load()
        </script>
      </form>
    `)
  })
  app.post('/render', async (request, response) => {
    const errors = {
      MANIFEST_OR_VITE_MISSING: {
        status: 400,
        message: `either a manifest must be passed or a Vite instance must be running`,
      },
      NO_INPUT: {
        message: `no input was specified`,
      },
      INPUT_DOES_NOT_EXIST: {
        message: `input file does not exist`,
      },
      MANIFEST_DOES_NOT_EXIST: {
        message: `manifest file does not exist`,
      },
    }

    try {
      const { page, manifest, input } = request.body
      const time = Date.now()

      // Log when the request entered
      logger?.info(`${chalk.yellow(`→ ${page?.location.href || '(empty)'}`)}`, {
        timestamp: true,
      })

      // Remember last X requests
      latestRequestedPages.unshift({
        time,
        page,
      })
      latestRequestedPages.splice(5)
      console.log(input)
      console.log(vite?.config.build.rollupOptions.input)
      console.log(manifest)

      // Check prerequisites
      if (!manifest && !vite) {
        throw new Error('MANIFEST_OR_VITE_MISSING')
      }

      if (!input) {
        throw new Error('NO_INPUT')
      }

      if (input && !fs.existsSync(input)) {
        throw new Error('INPUT_DOES_NOT_EXIST')
      }

      if (manifest && !fs.existsSync(manifest)) {
        throw new Error('MANIFEST_DOES_NOT_EXIST')
      }

      // Load manifest
      const loadedManifest: Manifest = vite
        ? /*new Proxy(
        {},
        {
          get(_target, _id: string): ManifestChunk | undefined {
            const module = vite?.moduleGraph.getModuleById(path.join(vite?.config.root || '', id))
            const hmrPort = Number(vite?.config.server.hmr?.port)
            
            if (!module) {
              return undefined
            }

            return {
              file: module.url,
            }

            return undefined
          },
        },
      )*/ {}
        : safeParse<Manifest, Manifest>(
            await fs.promises.readFile(manifest, 'utf-8'),
            () => {
              return {}
            },
          )

      // Get render app function
      const renderApp: RenderApp = await (vite
        ? await vite.ssrLoadModule(input, {
            fixStacktrace: true,
          })
        : // @ts-ignore
          await import(
            path.join(path.dirname(manifest), loadedManifest[input]['file'])
          )
      ).default

      // Render and reply with result
      response.json(
        await render(renderApp, page, {
          manifest: loadedManifest,
          logger,
          vite,
        }),
      )

      // Log how long it took to render the page
      logger?.info(
        `${chalk.green(`← ${page.location.href} (${Date.now() - time}ms)`)}`,
        {
          timestamp: true,
        },
      )
    } catch (error) {
      let status = 500
      let message = String(error)
      let code: string | null = null

      // Check if the error is a predefined error and adjust response
      if (error instanceof Error) {
        const details = errors[error.message as keyof typeof errors]

        if (details) {
          // Use core helper to throw error again
          safe(
            () => {
              throwError(details.message)
            },
            (error) => {
              if (error instanceof Error) {
                logger?.error(error.message, {
                  timestamp: true,
                  error,
                })
              }
            },
          )
        } else {
          logger?.error(error.message, {
            timestamp: true,
            error,
          })
        }
      }

      response.status(status).json({
        code,
        message,
      })
    }
  })
  app.get('*', async (_request, response) => {
    response.send(``)
  })
  app.post('*', async (_request, response) => {
    response.send(``)
  })

  // Start server
  const finalPort = await getPort({
    host,
    port,
  })
  return new Promise((resolve, reject) => {
    const server = app
      .listen(finalPort, host, () => {
        resolve({
          app,
          async restart() {
            await vite?.restart()
          },
          printUrls() {
            logger?.info(
              `\n  ${chalk.magenta(
                `${chalk.bold('NAVIGARE')} v${getVersion()}  core v${chalk.bold(
                  getCoreVersion(),
                )}`,
              )}\n`,
            )
            logger?.info(
              `  ${chalk.magenta('➜')}  ${chalk.bold('SSR')}: ${chalk.cyan(
                `http://${host}:${finalPort}`,
              )}`,
            )
          },
        })
      })
      .on('error', (error) => {
        reject(error)
      })

    // Close server before exit
    process.on('beforeExit', () => {
      server.close()
    })

    // Catch uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger?.error(
        `We observed an uncaught exception. Did you try to access a global variable like "window" which is not available in Node environment?
${error.stack}`,
        {
          clear: true,
          timestamp: true,
          error: error,
        },
      )
    })
  })
}
