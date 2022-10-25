import { ContextOf } from './types'
import { Router } from '@navigare/core'
import { DefineComponent, InjectionKey, markRaw, provide, reactive } from 'vue'

export const RouterContext: InjectionKey<{
  router: Router<DefineComponent>
}> = Symbol('RouterContext')

export default function provideRouterContext(
  router: Router<DefineComponent>,
): ContextOf<typeof RouterContext> {
  const context: ContextOf<typeof RouterContext> = reactive({
    router: markRaw(router),
  })

  // Provide context
  provide(RouterContext, context)

  return context
}
