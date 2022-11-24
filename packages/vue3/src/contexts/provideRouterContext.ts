import { ContextOf } from './../types'
import { FragmentContext } from './provideFragmentContext'
import { Router } from '@navigare/core'
import { throwError } from '@navigare/core'
import { DefineComponent, InjectionKey, markRaw, provide, reactive } from 'vue'

export const RouterContext: InjectionKey<{
  router: Router<DefineComponent>
  fragments: Record<string, ContextOf<typeof FragmentContext>>
}> = Symbol('RouterContext')

export default function provideRouterContext(
  router: Router<DefineComponent>,
): ContextOf<typeof RouterContext> {
  if (!router) {
    throwError(
      'Router is missing. Did you pass the props to Root component in `createApp`?',
    )
  }

  const context: ContextOf<typeof RouterContext> = reactive({
    router: markRaw(router),
    fragments: {},
  })

  // Provide context
  provide(RouterContext, context)

  return context
}
