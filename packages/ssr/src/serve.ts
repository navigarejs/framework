import { getCoreVersion, getVersion } from './internals'
import { Options, Server } from './types'
import { renderHead } from './utilities'
import { Page, RenderedApp, safeParse, throwError } from '@navigare/core'
import bodyParser from 'body-parser'
import chalk from 'chalk'
import compression from 'compression'
import express from 'express'
import fs from 'fs'
import getPort from 'get-port'
import isArray from 'lodash.isarray'
import isObject from 'lodash.isobject'
import { createServer, Manifest, ViteDevServer } from 'vite'

// const isTest = process.env.NODE_ENV === 'test' || !!process.env.VITE_TEST_BUILD
const isProduction = process.env.NODE_ENV === 'production'

export default async function (
  options: Partial<Options> = {
    port: Number(process.env.NAVIGARE_PORT),
  },
): Promise<Server> {
  const {
    input,
    manifest,
    logger,
    host = '0.0.0.0',
    port = 13714,
    id = 'app',
    htmlAttrs = '',
    headTags = '',
    bodyAttrs = '',
    bodyTags = '',
  } = options

  // Create express server
  const app = express()
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: false }))

  // Keep track of certain statistics
  const latestRequestedPages: {
    time: number
    page: Page
  }[] = []

  // Create Vite server if necessary
  let vite: ViteDevServer | undefined = undefined
  if (isProduction) {
    app.use(compression())
  } else {
    vite = await createServer({
      build: {
        ssr: true,
      },
      server: {
        middlewareMode: true,
        hmr: {
          port: await getPort({
            host,
          }),
        },
      },
      appType: 'custom',
    })

    // Use vite's connect instance as middleware
    app.use(vite.middlewares)
  }

  // Define routes
  app.get('/', async (_request, response) => {
    response.send(`
      <form id="form" method="post" action="/">
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
  const render = async (page: Page | null): Promise<RenderedApp> => {
    const viteInput = vite?.config.build.rollupOptions.input
    const finalViteInput = isArray(viteInput)
      ? viteInput[0]
      : isObject(viteInput)
      ? viteInput[Object.keys(viteInput)[0]]
      : viteInput

    /*// Try to fallback to manifest
      if (!manifest) {
        let viteManifest = vite?.config.build.manifest
        if (viteManifest === true) {
            viteManifest = path.resolve(vite?.config.build.outDir ?? '', 'manifest.json')
        }
        
        if (viteManifest && fs.existsSync(viteManifest)) {
          throwError(`manifest file "${input}" does not exist`)
        }
      }*/

    if (!input && !finalViteInput) {
      throwError('no input file was specified')
    }

    if (input && !fs.existsSync(input)) {
      throwError(`input file "${input}" does not exist`)
    }

    if (manifest && !fs.existsSync(manifest)) {
      throwError(`manifest file "${manifest}" does not exist`)
    }

    logger?.info(`${chalk.yellow(`→ ${page?.location.href || '(empty)'}`)}`, {
      timestamp: true,
    })

    // Prepare empty response that will be used in case of errors or empty requests
    const modules = new Set<string>()
    const emptyResponse = {
      id,
      modules,
      htmlAttrs,
      headTags,
      bodyAttrs,
      bodyTags,
      appHTML: '',
    }

    if (!page) {
      logger?.info(`${chalk.green(`← (empty)`)}`, {
        timestamp: true,
      })
      return emptyResponse
    }

    const time = Date.now()

    // Remember last X requests
    latestRequestedPages.unshift({
      time,
      page,
    })
    latestRequestedPages.splice(5)

    // Return rendered page
    try {
      const loadedInput = (
        input
          ? // @ts-ignore
            (await import(input)).default
          : await vite!.ssrLoadModule(finalViteInput!, {
              fixStacktrace: true,
            })
      ) as any
      const loadedManifest: Manifest | null = manifest
        ? safeParse<Manifest>(await fs.promises.readFile(manifest, 'utf-8'))
        : /*new Proxy(
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
          )*/ null

      // Render page
      const renderedPage = await loadedInput.default(
        page,
        loadedManifest || {},
        vite,
      )

      // Render head
      const renderedHead = renderHead(
        renderedPage.modules,
        loadedManifest || {},
      )

      // Log how long it took to render the page
      logger?.info(
        `${chalk.green(`← ${page.location.href} (${Date.now() - time}ms)`)}`,
        {
          timestamp: true,
        },
      )

      return {
        id,
        modules: renderedPage.modules || modules,
        htmlAttrs: renderedPage.htmlAttrs || htmlAttrs,
        headTags: `${renderedPage.headTags || headTags}${renderedHead}`,
        bodyAttrs: renderedPage.bodyAttrs || bodyAttrs,
        bodyTags: renderedPage.bodyTags || bodyTags,
        appHTML: renderedPage.appHTML || '',
      }
    } catch (error: any) {
      logger?.error(error, {
        clear: true,
        error,
        timestamp: true,
      })
      return emptyResponse
    }
  }
  app.post('/', async (request, response) => {
    const page =
      request.headers['content-type'] === 'application/x-www-form-urlencoded'
        ? safeParse(request.body.page)
        : request.body

    response.json(await render(page))
  })

  // Start server
  const finalPort = await getPort({
    host,
    port,
  })
  return new Promise((resolve, reject) => {
    app
      .listen(finalPort, host, () => {
        resolve({
          app,
          vite,
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
  })
}
