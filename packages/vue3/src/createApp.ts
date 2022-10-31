import { devToolsPlugin } from '.'
import Root from './Root'
import plugin from './plugin'
import { Options, App } from './types'
import {
  Page,
  throwError,
  resolvePageComponents,
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
  const initialComponents = await resolvePageComponents(
    resolveComponent,
    initialPageWithFallback,
  )
  const options: RouterOptions<DefineComponent> = {
    initialPage: initialPageWithFallback,
    initialComponents,
    resolveComponent,
    fragments,
  }
  const router = new Router<DefineComponent>(options)
  const root = setup({
    Root,
    props: {
      router,
      layout: options.initialPage.layout,
      Layout,
    },
    initialPage: initialPageWithFallback,
    router,
    plugin,
  })

  // Provide router
  root.config.globalProperties.router = router

  // Add plugins
  const head = createHead()
  root.use(head)
  root.use(plugin)

  // Add development pugin
  if (
    process.env.NODE_ENV === 'development' ||
    '__VUE_PROD_DEVTOOLS__' in globalThis
  ) {
    root.use(devToolsPlugin)
  }

  return {
    id,
    page: initialPageWithFallback,
    head,
    root,
  }
}
