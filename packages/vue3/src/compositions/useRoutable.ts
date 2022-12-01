import useRouter from '../compositions/useRouter'
import useFragment from './useFragment'
import {
  isDefined,
  PartialRoute,
  RawRouteMethod,
  Routable,
  RouteMethod,
  RouterLocation,
  VisitData,
  VisitOptions,
  ResolvedRoutable,
  Route,
  castArray,
  isArray,
  isFunction,
  shouldInterceptLink,
} from '@navigare/core'
import { Component, computed, markRaw, reactive, ref } from 'vue'

type MatchingRoute = (Routable | PartialRoute) | (Routable | PartialRoute)[]

export default function useRoutable(
  getRoute: MatchingRoute | undefined | (() => MatchingRoute | undefined),
  options: {
    data?: VisitData | (() => VisitData)
    method?: RawRouteMethod | (() => RawRouteMethod)
  } = {},
): {
  href?: string
  active: boolean
  foreign: boolean
  method: RouteMethod | undefined
  components: Component[] | undefined
  location: RouterLocation | undefined
  preload: () => Promise<void>
  visit: (options?: VisitOptions) => Promise<void>
  pending: boolean
  shouldInterceptLink: (event: KeyboardEvent | MouseEvent) => boolean
} {
  const router = useRouter()
  const fragment = useFragment()
  const route = computed(() => {
    if (isFunction(getRoute)) {
      return getRoute()
    }

    return getRoute
  })
  const data = computed(() => {
    if (isFunction(options.data)) {
      return options.data()
    }

    return options.data ?? {}
  })
  const method = computed(() => {
    if (isFunction(options.method)) {
      return options.method()
    }

    return options.method ?? 'GET'
  })
  const routable = computed(() => {
    if (isArray(route.value)) {
      return route.value[0]
    }

    return route.value
  })
  const resolvedRoutable = computed((): ResolvedRoutable | undefined => {
    if (!router.instance.isRoutable(routable.value)) {
      return undefined
    }

    return router.instance.resolveRoutable(routable.value, data.value, {
      method: method.value,
    })
  })
  const foreign = computed(() => {
    const { location } = resolvedRoutable.value || {}

    if (!location?.origin) {
      return false
    }

    return location.origin !== router.location.origin
  })
  const active = computed(() => {
    // Check if the passed route matches the current location
    return castArray(route.value)
      .filter(isDefined)
      .some((route) => {
        const matches = router.match(
          route,
          new Route(fragment.rawRoute, fragment.parameters, true),
        )

        return matches
      })
  })
  const pending = ref(false)
  const resolvedHref = computed(() => {
    return resolvedRoutable.value?.location.href
  })
  const resolvedMethod = computed(() => {
    return resolvedRoutable.value?.method
  })
  const components = computed(() => {
    return resolvedRoutable.value?.components
  })
  const location = computed(() => {
    return resolvedRoutable.value?.location
  })

  // Create handlers
  const preload = async () => {
    const { components = [] } = resolvedRoutable.value || {}

    await Promise.all(
      components.map((component) => {
        return router.instance.getComponentModule(component)
      }),
    )
  }
  const visit = async (options: VisitOptions = {}) => {
    if (!router.instance.isRoutable(routable.value)) {
      return
    }

    await router.instance.visit(routable.value, {
      ...options,
      data: data.value,
      method: resolvedMethod.value,
      events: {
        ...options.events,
        start: (event) => {
          options.events?.start?.(event)

          pending.value = true
        },
        finish: (event) => {
          options.events?.finish?.(event)

          pending.value = false
        },
      },
    })
  }

  return reactive({
    href: resolvedHref,
    active: active,
    foreign: foreign,
    method: resolvedMethod,
    components,
    location,
    preload: markRaw(preload),
    visit: markRaw(visit),
    pending: pending,
    fragment,
    shouldInterceptLink: markRaw(shouldInterceptLink),
  })
}
