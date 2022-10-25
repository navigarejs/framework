import { App } from './types'
import { RenderedApp } from '@navigare/core'
import { renderToString } from '@vue/server-renderer'
import { renderHeadToString } from '@vueuse/head'

export default async function renderApp({
  id,
  app,
  head,
}: App): Promise<RenderedApp> {
  const appHTML = await renderToString(app)
  const { headTags, htmlAttrs, bodyAttrs, bodyTags } = renderHeadToString(head)

  return {
    id,
    headTags,
    htmlAttrs,
    bodyAttrs,
    bodyTags,
    appHTML,
  }
}
