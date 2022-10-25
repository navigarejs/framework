import createApp from './createApp'
import { Page } from '@navigare/core'
import { renderNavigareApp } from '@navigare/vue3'

export default async function ssr(initialPage: Page) {
  const app = await createApp(initialPage)

  return await renderNavigareApp(app)
}
