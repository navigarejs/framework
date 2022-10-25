import { injectRouterContext } from './injectRouterContext'
import { PageFragmentContext } from './providePageFragmentContext'
import { ContextOf } from './types'
import { inject, reactive } from 'vue'

export function injectPageFragmentContext(): ContextOf<
  typeof PageFragmentContext
> {
  const { router } = injectRouterContext()
  const context = inject(PageFragmentContext, {
    fragment: null,
    rawRoute: router.page.rawRoute,
    parameters: router.page.parameters,
    defaults: router.page.defaults,
  })

  return reactive(context)
}
