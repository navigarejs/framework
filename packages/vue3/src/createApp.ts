import AppVue from './App'
import plugin from './plugin'
import { Options, App } from './types'
import {
  Page,
  throwError,
  resolveComponents,
  isSSR,
  safeParse,
  Router,
  RouterOptions,
} from '@navigare/core'
import { createHead } from '@vueuse/head'
import { DefineComponent } from 'vue'

export default async function createApp({
  id = 'app',
  setup,
  resolveComponent,
  initialPage,
  rawRoutes,
  Layout,
  fragments,
}: Options): Promise<App> {
  const initialPageWithFallback =
    initialPage ||
    (isSSR()
      ? null
      : (safeParse(
          document.getElementById(id)?.dataset.page as string,
        ) as Page | null))

  if (!initialPageWithFallback) {
    throwError('Navigare: no initial page is specified')
  }

  // Create app instance
  const initialComponents = await resolveComponents(
    resolveComponent,
    initialPageWithFallback,
  )
  const options: RouterOptions<DefineComponent> = {
    initialPage: initialPageWithFallback,
    initialComponents,
    resolveComponent,
    rawRoutes,
    fragments,
  }
  const router = new Router<DefineComponent>(options)
  const app = setup({
    App: AppVue,
    props: {
      router,
      layout: options.initialPage.layout,
      Layout,
    },
    initialPage: initialPageWithFallback,
    router,
    plugin,
  })

  // Add plugins
  const head = createHead()
  app.use(head)

  return {
    id,
    page: initialPageWithFallback,
    head,
    app,
  }
}
