import {
  ContextOf,
  FormControl,
  FormError,
  FormInputName,
  FormInputPath,
  FormValue,
} from './../types'
import type { DebouncedFunc } from 'lodash'
import { InjectionKey, provide } from 'vue'

export const InputContext: InjectionKey<{
  form: FormControl
  path: FormInputPath
  name: FormInputName
  value: FormValue
  errors: FormError
  feedback: string
  validating: boolean
  focused: boolean
  validate: DebouncedFunc<() => Promise<void>>
  handleInput: (event: Event) => void
  handleChange: (event: Event) => void
  handleFocus: (event: Event) => void
  handleBlur: (event: Event) => void
}> = Symbol('InputContext')

export default function provideInputContext(
  context: ContextOf<typeof InputContext>,
): ContextOf<typeof InputContext> {
  // Provide context
  provide(InputContext, context)

  return context
}
