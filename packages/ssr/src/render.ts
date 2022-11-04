import { Logger, RenderApp } from './types'
import { renderHead } from './utilities'
import { Page, RenderedApp } from '@navigare/core'
import chalk from 'chalk'
import { Manifest, ViteDevServer } from 'vite'

export interface Options {
  manifest?: Manifest
  base?: string
  logger?: Logger
  vite?: ViteDevServer
}

export default async function render(
  renderApp: RenderApp,
  page: Page | null,
  options: Options = {},
): Promise<RenderedApp> {
  const { manifest = {}, logger, vite, base = '/' } = options
  const id = 'app'
  const defaultHtmlAttributes = ''
  const defaultHeadTags = ''
  const defaultBodyAttributes = ''
  const defaultBodyTags = ''

  /*const viteInput = vite?.config.build.rollupOptions.input
  const finalViteInput = isArray(viteInput)
    ? viteInput[0]
    : isObject(viteInput)
    ? viteInput[Object.keys(viteInput)[0]]
    : viteInput*/

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

  // Prepare empty response that will be used in case of errors or empty requests
  const modules = new Set<string>()
  const emptyApp: RenderedApp = {
    id,
    modules,
    htmlAttributes: defaultHtmlAttributes,
    headTags: defaultHeadTags,
    bodyAttributes: defaultBodyAttributes,
    bodyTags: defaultBodyAttributes,
    appHTML: '',
  }

  if (!page) {
    logger?.info(`${chalk.green(`← (empty)`)}`, {
      timestamp: true,
    })

    return emptyApp
  }

  try {
    // Render app
    const renderedApp = await renderApp(page, manifest, vite)

    // Render head
    const renderedHead = renderHead(renderedApp.modules, manifest, base)

    return {
      id,
      modules: renderedApp.modules || modules,
      htmlAttributes: renderedApp.htmlAttributes || defaultHtmlAttributes,
      headTags: `${renderedApp.headTags || defaultHeadTags}${renderedHead}`,
      bodyAttributes: renderedApp.bodyAttributes || defaultBodyAttributes,
      bodyTags: renderedApp.bodyTags || defaultBodyTags,
      appHTML: renderedApp.appHTML || '',
    }
  } catch (error: any) {
    logger?.error(error, {
      clear: true,
      error,
      timestamp: true,
    })
    return emptyApp
  }
}
