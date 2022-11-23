import { ContextOf } from './../types'
import { injectRouterContext } from './injectRouterContext'
import { FragmentContext } from './provideFragmentContext'
import { computed, inject, reactive } from 'vue'

export function injectFragmentContext(): ContextOf<typeof FragmentContext> {
  const { router } = injectRouterContext()
  const context = inject(FragmentContext, undefined)
  const name = computed(() => {
    return context?.name || null
  })
  const properties = computed(() => {
    return context?.properties || {}
  })
  const rawRoute = computed(() => {
    return context?.rawRoute || router.page.rawRoute
  })
  const parameters = computed(() => {
    return context?.parameters || router.page.parameters
  })
  const defaults = computed(() => {
    return context?.defaults || router.page.defaults
  })
  const location = computed(() => {
    return context?.location || router.page.location
  })

  return reactive({
    name,
    properties,
    rawRoute,
    parameters,
    defaults,
    location,
  })
}
