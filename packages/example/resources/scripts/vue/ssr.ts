import { renderNavigareApp } from '@navigare/vue3'
import { Page } from '@navigare/core'
import createApp from './createApp'

export default async function ssr(initialPage: Page) {
  const app = await createApp(initialPage)

  return await renderNavigareApp(app)
}
