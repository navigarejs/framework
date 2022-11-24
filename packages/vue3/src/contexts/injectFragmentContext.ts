import { ContextOf } from './../types'
import { FragmentContext } from './provideFragmentContext'
import { inject } from 'vue'

export function injectFragmentContext():
  | ContextOf<typeof FragmentContext>
  | undefined {
  const context = inject(FragmentContext, undefined)

  return context
}
