import { throwError } from '@navigare/core'
import { inject } from 'vue'
import { RouterContext } from './provideRouterContext'
import { ContextOf } from './types'

export function injectRouterContext(): ContextOf<typeof RouterContext> {
  const context = inject(RouterContext)

  if (!context) {
    throwError(
      'Router context is not available. Did you use "createApp" before?',
    )
  }

  return context
}
