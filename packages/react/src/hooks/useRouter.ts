import RouterContext from '../contexts/RouterContext'
import { RouterControl } from '../types'
import useFragment from './useFragment'
import usePage from './usePage'
import {
  isArray,
  PartialRoute,
  Routable,
  Route,
  RouteName,
} from '@navigare/core'
import { useCallback, useContext, useMemo } from 'react'

export default function useRouter(): RouterControl {
  const { router } = useContext(RouterContext)
  const page = usePage()
  const fragment = useFragment()
  const route = useMemo<Route>(() => {
    return new Route(fragment.rawRoute, fragment.parameters, {
      absolute: false,
    })
  }, [fragment.rawRoute, fragment.parameters])
  const parameters = computed(() => fragment.parameters)
  const match = useCallback(
    (
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
        baseRoute ?? route,
        fragment.location,
        fragment.defaults,
      )

      return matches
    },
    [fragment.location, fragment.defaults, router, route],
  )

  return {
    page,
    previousPage: router.previousPage,
    latestPage: router.latestPage,
    pages: router.pages,
    instance: router,
    location: page.location,
    parameters: router.param, route, layout, fragment,
    fragments, processing,

    visit: useCallback(async (routable, options = {}) => {
      return await router.visit(routable, options)
    }, []),

    get: useCallback(async (routable, data = {}, options = {}) => {
      return await router.get(routable, data, options)
    }, []),

    post: useCallback(async (routable, data = {}, options = {}) => {
      return await router.post(routable, data, options)
    }, []),

    put: useCallback(async (routable, data, options) => {
      return await router.put(routable, data, options)
    }, []),

    patch: useCallback(async (routable, data, options) => {
      return await router.patch(routable, data, options)
    }, []),

    delete: useCallback(async (routable, options = {}) => {
      return await router.delete(routable, options)
    }, []),

    reload: useCallback(async (options = {}) => {
      return await router.reload(options)
    }, []),

    back: useCallback(async (fallback) => {
      return await router.back(fallback)
    }, []),

    match,

    on: useCallback((name, listener) => {
      return router.on(name, listener)
    }, []),

    off: useCallback((name, listener) => {
      return router.off(name, listener)
    }, []),

    resolve: useCallback((routable: Routable) => {
      return router.resolveRoutable(routable).location.href
    }, []),

    instance: router,

    generateErrorLink: useCallback((file, row, column, url) => {
      return router.options.generateErrorLink?.(file, row, column, url) ?? null
    }, []),

    reportError: useCallback((error: unknown) => {
      router.reportError(error)
    }, []),
  }
}
