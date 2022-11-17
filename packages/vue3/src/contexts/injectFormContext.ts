import { ContextOf } from '../types'
import { FormContext } from './provideFormContext'
import { inject } from 'vue'

export function injectFormContext(): ContextOf<typeof FormContext> {
  const context = inject(FormContext, {
    form: null,
  })

  return context
}
