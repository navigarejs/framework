import { Page, RenderedApp, safeParse, throwError } from '@navigare/core'
import bodyParser from 'body-parser'
import chalk from 'chalk'
import compression from 'compression'
import express from 'express'
import { createServer, ViteDevServer } from 'vite'
import { Options, Server } from './types'
import fs from 'fs'
import path from 'path'
import getPort from 'get-port'
import isArray from 'lodash.isarray'
import isObject from 'lodash.isobject'
import { createRequire } from 'module'

// const isTest = process.env.NODE_ENV === 'test' || !!process.env.VITE_TEST_BUILD
const isProduction = process.env.NODE_ENV === 'production'

// "require" is not available in modules anymore so we use this workaround
const require = createRequire(import.meta.url)

const pkg = safeParse(
  fs.readFileSync(path.join(__dirname, './../package.json'), 'utf-8'),
) as { version: string }

const pluginPkg = safeParse(
  fs.readFileSync(
    path.join(require.resolve('@navigare/core'), './../../package.json'),
    'utf-8',
  ),
) as { version: string }

export default async function (
  options: Partial<Options> = {
    port: Number(process.env.NAVIGARE_PORT),
  },
): Promise<Server> {
  const {
    input,
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
          <textarea name="page" id="page" cols="120" rows="15"></textarea>
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
    const finalInput = input || vite?.config.build.rollupOptions.input
    const firstInput = isArray(finalInput)
      ? finalInput[0]
      : isObject(finalInput)
      ? finalInput[Object.keys(finalInput)[0]]
      : finalInput

    if (!firstInput) {
      throwError('no SSR input file was specified')
    }

    if (!fs.existsSync(firstInput)) {
      throwError(`SSR input file "${firstInput}" does not exist`)
    }

    logger?.info(`${chalk.yellow(`→ ${page?.location.href || '(empty)'}`)}`)

    // Prepare empty response that will be used in case of errors or empty requests
    const emptyResponse = {
      id,
      htmlAttrs,
      headTags,
      bodyAttrs,
      bodyTags,
      appHTML: '',
    }

    if (!page) {
      logger?.info(`${chalk.green(`← (empty)`)}`)
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
      const { default: ssr } = (
        isProduction
          ? // @ts-ignore
            (await import(firstInput)).default
          : await vite!.ssrLoadModule(firstInput, {
              fixStacktrace: true,
            })
      ) as any
      const manifest = isProduction
        ? {} // await import('../public/js/ssr-manifest.json')
        : {}

      // Try to render
      const renderedPage = await ssr(page, manifest, vite)

      // Log how long it took to render the page
      logger?.info(
        `${chalk.green(`← ${page.location.href} (${Date.now() - time}ms)`)}`,
      )

      return {
        id,
        htmlAttrs: renderedPage.htmlAttrs || htmlAttrs,
        headTags: renderedPage.headTags || headTags,
        bodyAttrs: renderedPage.bodyAttrs || bodyAttrs,
        bodyTags: renderedPage.bodyTags || bodyTags,
        appHTML: renderedPage.appHTML || '',
      }
    } catch (exception: any) {
      logger?.error(exception)
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
                `${chalk.bold('NAVIGARE')} v${
                  pkg.version
                }  plugin v${chalk.bold(pluginPkg.version)}`,
              )}\n`,
            )
            logger?.info(
              `  ${chalk.magenta('➜')}  ${chalk.bold('SSR')}: ${chalk.cyan(
                `http://${host}:${port}`,
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
