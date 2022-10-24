import { inject } from 'vue'
import { FormContext } from './provideFormContext'
import { ContextOf } from './types'

export function injectFormContext(): ContextOf<typeof FormContext> | null {
  const context = inject(FormContext, null)

  return context
}
