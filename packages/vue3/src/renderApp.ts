import { App } from './types'
import { RenderedApp } from '@navigare/core'
import { renderToString, SSRContext } from '@vue/server-renderer'
import { renderHeadToString } from '@vueuse/head'

export default async function renderApp({
  id,
  root,
  head,
}: App): Promise<RenderedApp> {
  const metadata: SSRContext = {}
  const appHTML = await renderToString(root, metadata)
  const {
    headTags,
    htmlAttrs: htmlAttributes,
    bodyAttrs: bodyAttributes,
    bodyTags,
  } = await renderHeadToString(head)

  return {
    id,
    modules: metadata.modules instanceof Set ? metadata.modules : new Set(),
    headTags,
    htmlAttributes,
    bodyAttributes,
    bodyTags,
    appHTML,
  }
}
