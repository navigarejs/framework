import { computed, InjectionKey, provide, reactive } from 'vue'
import { ContextOf } from './types'
import { PageFragment, Page } from '@navigare/core'
import useRouter from './useRouter'

export const PageFragmentContext: InjectionKey<{
  fragment: PageFragment | null
  rawRoute: Page['rawRoute']
  parameters: Page['parameters']
  defaults: Page['defaults']
}> = Symbol('PageFragmentContext')

export default function providePageFragmentContext(
  getFragment: () => PageFragment | null,
): ContextOf<typeof PageFragmentContext> {
  const router = useRouter()
  const fragment = computed(getFragment)
  const rawRoute = computed(
    () => fragment.value?.rawRoute ?? router.page.rawRoute,
  )
  const parameters = computed(
    () => fragment.value?.parameters ?? router.page.parameters,
  )
  const defaults = computed(
    () => fragment.value?.defaults ?? router.page.defaults,
  )
  const context: ContextOf<typeof PageFragmentContext> = reactive({
    fragment,
    rawRoute,
    parameters,
    defaults,
  })

  // Provide context
  provide(PageFragmentContext, context)

  return context
}
