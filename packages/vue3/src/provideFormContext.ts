import { VisitData } from '@navigare/core'
import { InjectionKey, markRaw, provide, reactive } from 'vue'
import { ContextOf, FormControl } from './types'

export const FormContext: InjectionKey<{
  form: FormControl<VisitData>
}> = Symbol('FormContext')

export default function provideFormContext(
  form: FormControl<VisitData>,
): ContextOf<typeof FormContext> {
  const context: ContextOf<typeof FormContext> = reactive({
    form: markRaw(form),
  })

  // Provide context
  provide(FormContext, context)

  return context
}
