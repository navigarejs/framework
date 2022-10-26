import { App } from './types'
import { RenderedApp } from '@navigare/core'
import { renderToString, SSRContext } from '@vue/server-renderer'
import { renderHeadToString } from '@vueuse/head'

export default async function renderApp({
  id,
  app,
  head,
}: App): Promise<RenderedApp> {
  const metadata: SSRContext = {}
  const appHTML = await renderToString(app, metadata)
  const { headTags, htmlAttrs, bodyAttrs, bodyTags } = renderHeadToString(head)

  return {
    id,
    modules: metadata.modules instanceof Set ? metadata.modules : new Set(),
    headTags,
    htmlAttrs,
    bodyAttrs,
    bodyTags,
    appHTML,
  }
}
