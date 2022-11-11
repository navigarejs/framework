import { FormContext } from './provideFormContext'
import { ContextOf } from './types'
import { inject } from 'vue'

export function injectFormContext(): ContextOf<typeof FormContext> {
  const context = inject(FormContext, {
    form: null,
  })

  return context
}
