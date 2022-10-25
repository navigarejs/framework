import { injectRouterContext } from './injectRouterContext'
import usePageFragment from './usePageFragment'
import {
  PartialRoute,
  Routable,
  EventListener,
  RouteName,
  Route,
} from '@navigare/core'
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

  return reactive({
    components,

    location,

    parameters,

    route,

    page,

    fragment,

    fragments,

    processing,

    matches(
      comparableRoute: Routable | PartialRoute<RouteName>,
      route?: Route<RouteName>,
    ) {
      return router.matches(
        comparableRoute,
        route ??
          (fragment.rawRoute
            ? new Route(fragment.rawRoute, fragment.parameters, false)
            : new Route(page.rawRoute, page.parameters, false)),
        fragment.defaults,
      )
    },

    async back(fallback?: Routable) {
      return await router.back(fallback)
    },

    instance: router,
  })
}
