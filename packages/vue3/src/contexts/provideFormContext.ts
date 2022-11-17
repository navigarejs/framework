import { ContextOf, FormControl } from './../types'
import { InjectionKey, markRaw, provide, reactive } from 'vue'

export const FormContext: InjectionKey<{
  form: FormControl | null
}> = Symbol('FormContext')

export default function provideFormContext(
  form: FormControl,
): ContextOf<typeof FormContext> {
  const context: ContextOf<typeof FormContext> = reactive({
    form: markRaw(form),
  })

  // Provide context
  provide(FormContext, context)

  return context
}
