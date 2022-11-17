import { ContextOf } from './../types'
import { InputContext } from './provideInputContext'
import { inject } from 'vue'

export function injectInputContext():
  | ContextOf<typeof InputContext>
  | undefined {
  const context = inject(InputContext, undefined)

  return context
}
