import { injectRouterContext } from './injectRouterContext'
import { PageFragmentContext } from './providePageFragmentContext'
import { ContextOf } from './types'
import { computed, inject, reactive } from 'vue'

export function injectPageFragmentContext(): ContextOf<
  typeof PageFragmentContext
> {
  const { router } = injectRouterContext()
  const rawRoute = computed(() => {
    return router.page.rawRoute
  })
  const parameters = computed(() => {
    return router.page.parameters
  })
  const defaults = computed(() => {
    return router.page.defaults
  })
  const location = computed(() => {
    return router.page.location
  })
  const context = inject(
    PageFragmentContext,
    reactive({
      name: null,
      properties: {},
      rawRoute,
      parameters,
      defaults,
      location,
    }),
  )

  return reactive(context)
}
