import { getCoreVersion, getVersion } from './internals'
import render from './render'
import { Logger, RenderApp, Server } from './types'
import { Page, safeParse } from '@navigare/core'
import bodyParser from 'body-parser'
import * as colorette from 'colorette'
import compression from 'compression'
import express from 'express'
import fs from 'fs'
import getPort from 'get-port'
import isString from 'lodash.isstring'
import { Manifest, ViteDevServer } from 'vite'

export interface Options {
  host: string
  port: number
  logger: Logger
  vite: ViteDevServer
}
const errors: Record<
  string,
  {
    status: number
    message: string
  }
> = {
  MANIFEST_OR_VITE_MISSING: {
    status: 400,
    message: `either a manifest must be passed or a Vite instance must be running`,
  },
  MANIFEST_AND_VITE_DEFINED: {
    status: 400,
    message: `either a manifest must be passed or a Vite instance must be running but not both at the same time`,
  },
  NO_INPUT: {
    status: 400,
    message: `no input was specified`,
  },
  INPUT_DOES_NOT_EXIST: {
    status: 400,
    message: `input file does not exist`,
  },
  MANIFEST_DOES_NOT_EXIST: {
    status: 400,
    message: `manifest file does not exist`,
  },
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
  const latestRequests: {
    time: number
    body: {
      page: Page
      base: string
      input: string
      manifest: string
      id: string
    }
  }[] = []

  // Use vite's connect instance as middleware
  if (vite) {
    app.use(vite.middlewares)
  }

  // Define routes
  app.get('/', async (_request, response) => {
    response.send(`
      <style>
        label {
          display: block;
        }
      </style>

      <form id="form" method="post" action="/render">
        <div>
          <div>
            <label for="input">Input</label>
            <input name="input" id="input" />
          </div>

          <div>
            <label for="base">Base</label>
            <input name="base" id="base" />
          </div>

          <div>
            <label for="Manifest">Manifest</label>
            <input name="manifest" id="manifest" />
          </div>

          <div>
            <label for="page">Page</label>
            <textarea name="page" id="page" cols="120" rows="12"></textarea>
          </div>
        </div>

        <button type="button" onclick="format()">Format</button>

        <button type="button" onclick="save()">Save</button>
      
        <button type="button" onclick="saveAndSubmit()">Submit</button>
      
        <ul>
          ${latestRequests
            .map(({ time, body }) => {
              return `<li style="cursor: pointer;" onclick="load(atob('${Buffer.from(
                JSON.stringify(body, null, 2),
              ).toString('base64')}'))">[${body.id || 'n/a'}] ${new Date(
                time,
              ).toISOString()}: ${body.page.location.href}</li>`
            })
            .join('\n')}
        </ul>

        <script>
          const input = document.getElementById('input')
          const manifest = document.getElementById('manifest')
          const base = document.getElementById('base')
          const page = document.getElementById('page')

          const safeParse = (value) => {
            try {
              return JSON.parse(value)
            } catch (error) {
              return null;
            }
          }

          const format = () => {
            const parsedPage = safeParse(page.value)

            if (!parsedPage) {
              return
            }
            
            page.value = JSON.stringify(parsedPage, null, 2)
          }

          const saveAndSubmit = () => {
            save()
            document.getElementById('form').submit()
          }

          const load = (body) => {
            parsedBody = safeParse(body || window.localStorage.getItem('body'))

            if (!parsedBody) {
              return
            }

            input.value = parsedBody.input
            manifest.value = parsedBody.manifest
            base.value = parsedBody.base
            page.value = JSON.stringify(parsedBody.page, null, 2)
          }

          const save = () => {
            const parsedPage = safeParse(page.value)

            if (!parsedPage) {
              return
            }

            window.localStorage.setItem('body', JSON.stringify({
              page: parsedPage,
              input: input.value,
              manifest: manifest.value,
              base: base.value,
            }))
          }

          load()
        </script>
      </form>
    `)
  })
  app.post('/render', async (request, response) => {
    const page = isString(request.body.page)
      ? safeParse(request.body.page)
      : request.body.page
    const id = request.body.id || 'n/a'
    const manifest = String(request.body.manifest || '')
    const input = String(request.body.input || '')
    const base = String(request.body.base || '')
    const time = Date.now()
    const href = page?.location?.href || ''

    try {
      // Log when the request entered
      logger?.info(
        `${colorette.yellow(`→ [${id}] Requesting ${colorette.bold(href)}`)}`,
        {
          timestamp: true,
        },
      )

      // Remember last X requests
      latestRequests.unshift({
        time,
        body: request.body,
      })
      latestRequests.splice(5)

      // Check prerequisites
      if (!manifest && !vite) {
        throw new Error('MANIFEST_OR_VITE_MISSING')
      }

      if (manifest && vite) {
        throw new Error('MANIFEST_AND_VITE_DEFINED')
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

      // Get render app function
      const renderApp: RenderApp = (
        vite
          ? await vite.ssrLoadModule(input, {
              fixStacktrace: true,
            })
          : // @ts-ignore
            await import(input)
      ).default

      // Load manifest
      const loadedManifest: Manifest = vite
        ? /*new Proxy(
        {},
        {
          get(_target, id: string): ManifestChunk | undefined {
            const module = vite?.moduleGraph.getModuleById(path.join(vite?.config.root || '', id))
            // const hmrPort = Number(vite?.config.server.hmr?.port)
            if (!module) {
              return undefined
            }
            console.log(module.url)

            return {
              file: module.url,
            }
          },
        },
      )*/ {}
        : safeParse<Manifest, Manifest>(
            await fs.promises.readFile(manifest, 'utf-8'),
            () => {
              return {}
            },
          )

      // Get initial styles in development mode
      // TODO: for some reason it only takes the first stylesheet
      // See: https://github.com/vitejs/vite/issues/2282
      const inputModule = await vite?.moduleGraph.getModuleByUrl(input, true)
      const styles = Array.from(inputModule?.importers ?? [])
        .map((importer) => {
          return {
            url: importer.url,
            content: importer.ssrModule?.default,
          }
        })
        .map(({ content }) => {
          const id = Math.random().toString(16).substring(2)

          return `
            <style id="${id}" type="text/css" data-vite-dev-id="${id}">
              ${content}
            </style>
            <script> 
              window.onload = () => {
                const style = document.getElementById('${id}')
                const script = style.nextElementSibling

                style.remove()
                script.remove()
              }
            </script>
          `
        })
        .join('')

      // Render and reply with result
      response.json(
        await render(renderApp, page, {
          base,
          manifest: loadedManifest,
          logger,
          vite,
          defaultHeadTags: `${styles}`,
        }),
      )

      // Log how long it took to render the page
      logger?.info(
        `${colorette.green(
          `← [${id}] Rendered response for ${colorette.bold(
            href,
          )} in ${colorette.bold(Date.now() - time)}ms`,
        )}`,
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
          code = error.message
          message = details.message
          status = details.status
        }

        logger?.error(
          `${colorette.red(
            `← [${id}] Error while rendering ${colorette.bold(
              href,
            )}: ${message} (${Date.now() - time}ms)`,
          )}`,
          {
            timestamp: true,
            error,
          },
        )
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
              `\n  ${colorette.magenta(
                `${colorette.bold(
                  'NAVIGARE',
                )} v${getVersion()}  core v${colorette.bold(getCoreVersion())}`,
              )}\n`,
            )
            logger?.info(
              `  ${colorette.magenta('➜')}  ${colorette.bold(
                'SSR',
              )}: ${colorette.cyan(`http://${host}:${finalPort}`)}`,
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
