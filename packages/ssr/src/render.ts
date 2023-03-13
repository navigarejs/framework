import { Logger, RenderApp } from './types'
import { renderHead } from './utilities'
import { Page, RenderedApp } from '@navigare/core'
import colorette from 'colorette'
import { Manifest, ViteDevServer } from 'vite'

export interface Options {
  manifest?: Manifest
  base?: string
  logger?: Logger
  vite?: ViteDevServer
  id?: string
  defaultHtmlAttributes?: string
  defaultHeadTags?: string
  defaultBodyAttributes?: string
  defaultBodyTags?: string
}

export default async function render(
  renderApp: RenderApp,
  page: Page | null,
  options: Options = {},
): Promise<RenderedApp> {
  const {
    manifest = {},
    logger,
    vite,
    base = '/',
    id = 'app',
    defaultHtmlAttributes = '',
    defaultHeadTags = '',
    defaultBodyAttributes = '',
    defaultBodyTags = '',
  } = options

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
    logger?.info(`${colorette.green(`← (empty)`)}`, {
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
      htmlAttributes: [defaultHtmlAttributes, renderedApp.htmlAttributes]
        .filter(Boolean)
        .join(' '),
      headTags: [defaultHeadTags, renderedApp.headTags, renderedHead]
        .filter(Boolean)
        .join(''),
      bodyAttributes: [defaultBodyAttributes, renderedApp.bodyAttributes]
        .filter(Boolean)
        .join(' '),
      bodyTags: [defaultBodyTags, renderedApp.bodyTags].join(''),
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
