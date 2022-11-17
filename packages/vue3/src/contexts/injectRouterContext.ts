import { ContextOf } from './../types'
import { RouterContext } from './provideRouterContext'
import { throwError } from '@navigare/core'
import { inject } from 'vue'

export function injectRouterContext(): ContextOf<typeof RouterContext> {
  const context = inject(RouterContext)

  if (!context) {
    throwError(
      'Router context is not available. Did you use `createApp` before?',
    )
  }

  return context
}
