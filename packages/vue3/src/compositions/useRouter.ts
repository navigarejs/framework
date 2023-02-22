import { injectRouterContext } from './../contexts/injectRouterContext'
import { RouterControl } from './../types'
import useFragment from './useFragment'
import usePage from './usePage'
import { RouterEventListener, Route, isArray } from '@navigare/core'
import { PartialRoute } from '@navigare/core'
import { RouteName } from '@navigare/core'
import { Routable } from '@navigare/core'
import { computed, markRaw, onMounted, onUnmounted, reactive, ref } from 'vue'

export default function useRouter() {
  const { router } = injectRouterContext()
  const page = usePage()
  const previousPage = ref(router.previousPage)
  const latestPage = ref(router.latestPage)
  const pages = ref(router.pages)
  const location = computed(() => {
    return page.location
  })
  const layout = computed(() => {
    return page.layout
  })
  const fragment = useFragment()
  const parameters = computed(() => fragment.parameters)
  const route = computed<Route>(() => {
    return new Route(fragment.rawRoute, fragment.parameters, {
      absolute: false,
    })
  })
  const fragments = computed(() => {
    return page.fragments
  })
  const processing = ref(false)
  const match = computed(() => {
    const match = (
      comparableRoute:
        | Routable
        | PartialRoute<RouteName>
        | string
        | [Routable, ...(PartialRoute | string)[]],
      baseRoute?: Route<RouteName>,
    ): boolean => {
      if (isArray(comparableRoute)) {
        return comparableRoute.some((route) => {
          return match(route)
        })
      }

      const matches = router.match(
        comparableRoute,
        baseRoute ?? route.value,
        fragment.location,
        fragment.defaults,
      )

      return matches
    }

    return match
  })

  // Listen to current page
  const handleFinish: RouterEventListener<'finish'> = () => {
    processing.value = false
  }
  const handleStart: RouterEventListener<'start'> = () => {
    processing.value = true
  }
  const handleNavigate: RouterEventListener<'navigate'> = () => {
    previousPage.value = router.previousPage
    latestPage.value = router.latestPage
    pages.value = router.pages
  }
  const handleSuccess: RouterEventListener<'success'> = () => {}
  onMounted(() => {
    router.on('finish', handleFinish)
    router.on('start', handleStart)
    router.on('navigate', handleNavigate)
    router.on('success', handleSuccess)
  })
  onUnmounted(() => {
    router.off('finish', handleFinish)
    router.off('start', handleStart)
    router.off('navigate', handleNavigate)
    router.off('success', handleSuccess)
  })

  const control: RouterControl = reactive({
    location,

    parameters,

    route,

    page,

    previousPage,

    latestPage,

    pages,

    fragment,

    fragments,

    processing,

    layout,

    visit: markRaw(async (routable, options = {}) => {
      return await router.visit(routable, options)
    }),

    get: markRaw(async (routable, data = {}, options = {}) => {
      return await router.get(routable, data, options)
    }),

    post: markRaw(async (routable, data = {}, options = {}) => {
      return await router.post(routable, data, options)
    }),

    put: markRaw(async (routable, data, options) => {
      return await router.put(routable, data, options)
    }),

    patch: markRaw(async (routable, data, options) => {
      return await router.patch(routable, data, options)
    }),

    delete: markRaw(async (routable, options = {}) => {
      return await router.delete(routable, options)
    }),

    reload: markRaw(async (options = {}) => {
      return await router.reload(options)
    }),

    back: markRaw(async (fallback) => {
      return await router.back(fallback)
    }),

    match,

    on: markRaw((name, listener) => {
      return router.on(name, listener)
    }),

    off: markRaw((name, listener) => {
      return router.off(name, listener)
    }),

    resolve: markRaw((routable: Routable) => {
      return router.resolveRoutable(routable).location.href
    }),

    instance: markRaw(router),

    generateErrorLink: markRaw((file, row, column, url) => {
      return router.options.generateErrorLink?.(file, row, column, url) ?? null
    }),

    reportError: markRaw((error: unknown) => {
      router.reportError(error)
    }),
  })

  return control
}
