import AppVue from './App'
import plugin from './plugin'
import { Options, App } from './types'
import {
  Page,
  throwError,
  resolveComponents,
  isSSR,
  safeParse,
} from '@navigare/core'
import { createHead } from '@vueuse/head'

export default async function createApp({
  id = 'app',
  setup,
  resolveComponent,
  // title,
  initialPage,
  rawRoutes,
  layoutComponent,
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
  const app = setup({
    App: AppVue,
    props: {
      options: {
        initialPage: initialPageWithFallback,
        initialComponents,
        resolveComponent,
        rawRoutes,
        fragments,
      },
      layoutComponent,
    },
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
