import { injectRouterContext } from './injectRouterContext'
import { RouterControl } from './types'
import usePageFragment from './usePageFragment'
import { EventListener, Route, throwError } from '@navigare/core'
import {
  computed,
  DefineComponent,
  markRaw,
  onMounted,
  onUnmounted,
  reactive,
  ref,
} from 'vue'

export default function useRouter() {
  const { router } = injectRouterContext()
  const page = reactive(router.page)
  const location = computed(() => {
    return page.location
  })
  const fragment = usePageFragment()
  const parameters = computed(() => fragment.parameters)
  const route = computed(() => {
    return new Route(fragment.rawRoute, fragment.parameters, false)
  })
  const fragments = computed(() => {
    return page.fragments
  })
  const components = ref<Record<string, DefineComponent>>(
    markRaw(router.components),
  )
  const processing = ref(false)

  // Listen to current page
  const handleFinish: EventListener<'finish'> = () => {
    processing.value = false
  }
  const handleStart: EventListener<'start'> = () => {
    processing.value = true
  }
  const handleNavigate: EventListener<'navigate'> = (event) => {
    Object.assign(page, event.detail.page)
    components.value = markRaw(router.components)
  }
  const handleSuccess: EventListener<'success'> = () => {}
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
    components,

    location,

    parameters,

    route,

    page,

    fragment,

    fragments,

    processing,

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

    replace: markRaw(async (_routable) => {
      throwError('replace is not yet implemented')
    }),

    push: markRaw(async (_routable) => {
      throwError('push is not yet implemented')
    }),

    matches: markRaw((comparableRoute, route) => {
      return router.matches(
        comparableRoute,
        route ??
          (fragment.rawRoute
            ? new Route(fragment.rawRoute, fragment.parameters, false)
            : new Route(page.rawRoute, page.parameters, false)),
        fragment.defaults,
      )
    }),

    on: markRaw((name, listener) => {
      return router.on(name, listener)
    }),

    off: markRaw((name, listener) => {
      return router.off(name, listener)
    }),

    instance: markRaw(router),
  })

  return control
}
