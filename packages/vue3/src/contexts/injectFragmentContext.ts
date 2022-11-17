import { ContextOf } from './../types'
import { injectRouterContext } from './injectRouterContext'
import { FragmentContext } from './provideFragmentContext'
import { computed, inject, reactive } from 'vue'

export function injectFragmentContext(): ContextOf<typeof FragmentContext> {
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
    FragmentContext,
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
