import {
  ContextOf,
  FormControl,
  FormError,
  FormInputName,
  FormInputPath,
  FormSubmitOptions,
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
  touched: boolean
  validate: DebouncedFunc<() => Promise<void>>
  block: () => void
  unblock: () => void
  focus: (id?: string) => void
  blur: () => void
  submit: (options?: FormSubmitOptions) => void
  handleInput: (event: Event) => void
  handleChange: (event: Event) => void
}> = Symbol('InputContext')

export default function provideInputContext(
  context: ContextOf<typeof InputContext>,
): ContextOf<typeof InputContext> {
  // Provide context
  provide(InputContext, context)

  return context
}
