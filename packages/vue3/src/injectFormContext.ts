import { FormContext } from './provideFormContext'
import { ContextOf } from './types'
import { inject } from 'vue'

export function injectFormContext(): ContextOf<typeof FormContext> | null {
  const context = inject(FormContext, null)

  return context
}
