import { getFragmentKey } from '../utilities'
import { ContextOf } from './../types'
import { injectRouterContext } from './injectRouterContext'
import { Fragment, Page } from '@navigare/core'
import { computed, InjectionKey, provide, reactive, watch } from 'vue'

export const FragmentContext: InjectionKey<{
  name: string
  fragment: Fragment
  page: Omit<Page, 'fragments'>
  exposed: Record<string, Record<string, any>>
  key: string
}> = Symbol('FragmentContext')

export default function provideFragmentContext(
  name: string,
  getFragment: () => Fragment,
): ContextOf<typeof FragmentContext> {
  const router = injectRouterContext()
  const fragment = computed(() => {
    return getFragment()
  })
  const page = computed(() => {
    return fragment.value.page!
  })
  const key = computed(() => {
    return getFragmentKey(fragment.value)
  })
  const exposed: Record<string, Record<string, any>> = reactive({})

  // Provide context
  const context: ContextOf<typeof FragmentContext> = reactive({
    name,
    page,
    exposed,
    key,
    fragment,
  })
  provide(FragmentContext, context)

  // Notify router about context changes
  watch(
    () => key.value,
    () => {
      router.fragments[name] = context
    },
    {
      immediate: true,
    },
  )

  return context
}
