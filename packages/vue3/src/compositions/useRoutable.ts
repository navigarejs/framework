import useRouter from '../compositions/useRouter'
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
} from '@navigare/core'
import castArray from 'lodash.castarray'
import isArray from 'lodash.isarray'
import isFunction from 'lodash.isfunction'
import { Component, computed, markRaw, reactive, ref } from 'vue'

type Route = (Routable | PartialRoute) | (Routable | PartialRoute)[]

export default function useRoutable(
  getRoute: Route | undefined | (() => Route | undefined),
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
} {
  const router = useRouter()
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
        const matches = router.match(route)

        return matches
      })
  })
  const pending = ref(false)

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
      method: resolvedRoutable.value?.method,
      events: {
        start: () => {
          pending.value = true
        },
        finish: () => {
          pending.value = false
        },
      },
    })
  }

  return reactive({
    href: resolvedRoutable.value?.location.href,
    active: active.value,
    foreign: foreign.value,
    method: resolvedRoutable.value?.method,
    components: resolvedRoutable.value?.components,
    location: resolvedRoutable.value?.location,
    preload: markRaw(preload),
    visit: markRaw(visit),
    pending: pending.value,
  })
}
