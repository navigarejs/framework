import { inject } from 'vue'
import { RouterContext } from './provideRouterContext'
import { ContextOf } from './types'

export function injectRouterContext(): ContextOf<typeof RouterContext> {
  const context = inject(RouterContext)!

  return context
}
