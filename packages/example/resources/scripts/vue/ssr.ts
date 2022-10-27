import createApp from './createApp'
import { RenderApp } from '@navigare/ssr'
import { renderNavigareApp } from '@navigare/vue3'

const renderApp: RenderApp = async (page) => {
  const app = await createApp(page)

  return await renderNavigareApp(app)
}

export default renderApp
