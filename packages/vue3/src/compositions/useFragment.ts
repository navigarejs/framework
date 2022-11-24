import { injectRouterContext } from '../contexts/injectRouterContext'
import { FragmentControl } from '../types'
import { injectFragmentContext } from './../contexts/injectFragmentContext'
import { computed, reactive } from 'vue'

export default function useFragment(): FragmentControl
export default function useFragment(name: string): Partial<FragmentControl>
export default function useFragment(
  name?: string,
): FragmentControl | Partial<FragmentControl> {
  const router = injectRouterContext()
  const context = computed(() => {
    if (!name) {
      return injectFragmentContext()
    }

    return router.fragments[name] ?? undefined
  })
  const stableKey = context?.value?.key
  const fragment = computed(() => {
    return context.value?.fragment
  })
  const page = computed(() => {
    return context.value?.page ?? router.router.page
  })
  const properties = computed(() => {
    return {
      ...page.value?.properties,
      ...fragment.value?.properties,
    }
  })
  const key = computed(() => {
    return context.value?.key ?? null
  })
  const rawRoute = computed(() => {
    return page.value?.rawRoute
  })
  const parameters = computed(() => {
    return page.value?.parameters
  })
  const defaults = computed(() => {
    return page.value?.defaults
  })
  const location = computed(() => {
    return page.value?.location
  })
  const visit = computed(() => {
    return page.value?.visit
  })
  const exposed = computed(() => {
    if (!context.value) {
      return {}
    }

    const key = !name ? stableKey : context.value?.key

    if (!key) {
      return {}
    }

    if (!(key in context.value.exposed)) {
      context.value.exposed[key] = reactive({})
    }

    return context.value?.exposed[key]
  })

  // Expose again
  const control: FragmentControl = reactive({
    key,
    rawRoute,
    parameters,
    defaults,
    location,
    properties,
    visit,
    exposed,
  })

  return control
}
