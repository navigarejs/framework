import { injectInputContext } from '../contexts/injectInputContext'
import provideInputContext, {
  InputContext,
} from '../contexts/provideInputContext'
import {
  ContextOf,
  FormControl,
  FormInputName,
  FormSubmitOptions,
  FormValidationOptions,
  FormValue,
} from '../types'
import useForm from './useForm'
import { throwError, isDefined } from '@navigare/core'
import castArray from 'lodash.castarray'
import debounce from 'lodash.debounce'
import get from 'lodash.get'
import isArray from 'lodash.isarray'
import isFunction from 'lodash.isfunction'
import isString from 'lodash.isstring'
import mergeWith from 'lodash.mergewith'
import set from 'lodash.set'
import { computed, markRaw, reactive, ref, watch } from 'vue'

const resolveValidation = (
  validation?: FormValidationOptions,
): Partial<{
  on: 'input' | 'change' | false
  debounce: number
}> => {
  const on: 'input' | 'change' | false | undefined =
    validation === false
      ? false
      : validation === true
      ? undefined
      : validation?.on ?? undefined

  return {
    on,
  }
}

export default function useInput(
  getName: FormInputName | (() => FormInputName),
  options: {
    form?: FormControl
    validate?: FormValidationOptions
  } = {},
): ContextOf<typeof InputContext> {
  const { form = useForm()! } = options

  if (!form) {
    throwError(
      'You must either nest the Input within a Form component or pass a form (that was created via `createForm`) to the Input component.',
    )
  }

  const parent = injectInputContext()
  const name = computed(() => {
    if (isFunction(getName)) {
      return getName()
    }

    return getName
  })
  const path = computed(() => {
    if (!parent) {
      return [name.value]
    }

    return [...castArray(parent.path), name.value]
  })
  const checkValue = () => {
    if (!isDefined(get(form.values, path.value))) {
      throwError(`\`${name.value}\` is not defined in values of form.`)
    }
  }
  const value = computed<FormValue>({
    get: () => {
      checkValue()

      return get(form.values, path.value)
    },
    set: (nextValue) => {
      checkValue()

      set(form.values, path.value, nextValue)
    },
  })
  const errors = computed(() => {
    return get(form.errors, path.value)
  })
  const feedback = computed(() => {
    if (isArray(errors.value)) {
      return errors.value?.join('')
    }

    if (isString(errors.value)) {
      return errors.value
    }

    return ''
  })
  const validating = ref(false)
  const focused = ref(false)
  const touched = ref(false)
  const resolvedValidation = computed(
    (): {
      on: 'input' | 'change' | false
      debounce: number
    } => {
      const defaults = {
        on: 'input',
        debounce: 300,
      } as const

      return mergeWith(
        defaults,
        resolveValidation(form.options.validate),
        resolveValidation(options.validate),
      )
    },
  )

  // Create functions
  const validate = debounce(async () => {
    if (!resolvedValidation.value.on) {
      return
    }

    validating.value = true

    await form.validate(path.value)

    validating.value = false
  }, resolvedValidation.value.debounce)
  const block = () => {
    form.block(path.value)
  }
  const unblock = () => {
    form.unblock(path.value)
  }
  const submit = (options?: FormSubmitOptions) => {
    form.submit(options)
  }
  const focus = (id?: string) => {
    touched.value = true
    focused.value = true

    form.focus([
      ...[...path.value].slice(0, -1),

      [name.value, id].filter(isDefined).join('#'),
    ])
  }
  const blur = () => {
    focused.value = false
  }

  // Create handlers
  const handleInput = (_event: Event = new Event('input')) => {
    // Validate when `on` is not explicitly set to `false` and `on` is undefined/`on` is `input`
    if (resolvedValidation.value.on === 'input') {
      validate()
    }
  }
  const handleChange = (event: Event = new Event('change')) => {
    // Only validate when `on` is `change`
    if (resolvedValidation.value.on === 'change') {
      validate()
    }

    // File input do not work with v-model so this is the workaround
    if (
      event.target instanceof HTMLInputElement &&
      event.target.type === 'file'
    ) {
      value.value = event.target.files?.[0] ?? null
    }
  }

  // Emit change event when value was changed
  watch(
    () => value.value,
    () => {
      handleChange()
      validate()
    },
  )

  // Provide context
  const context = reactive({
    form: markRaw(form),
    name,
    path,
    value,
    errors,
    feedback,
    validating,
    focused,
    touched,
    validate: markRaw(validate),
    block: markRaw(block),
    unblock: markRaw(unblock),
    focus: markRaw(focus),
    blur: markRaw(blur),
    submit: markRaw(submit),
    handleInput: markRaw(handleInput),
    handleChange: markRaw(handleChange),
  })
  provideInputContext(context)

  return context
}
