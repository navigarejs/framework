import { injectInputContext } from '../contexts/injectInputContext'
import provideInputContext, {
  InputContext,
} from '../contexts/provideInputContext'
import { ContextOf, FormControl, FormInputName, FormValue } from '../types'
import useForm from './useForm'
import { throwError, isDefined } from '@navigare/core'
import castArray from 'lodash.castarray'
import debounce from 'lodash.debounce'
import get from 'lodash.get'
import isArray from 'lodash.isarray'
import isFunction from 'lodash.isfunction'
import isString from 'lodash.isstring'
import set from 'lodash.set'
import { computed, markRaw, reactive, ref, watch } from 'vue'

export default function useInput(
  getName: FormInputName | (() => FormInputName),
  options: {
    form?: FormControl
    validation?: {
      on?: 'input' | 'change' | false
      debounce?: number
    }
  } = {},
): ContextOf<typeof InputContext> {
  const { form = useForm()!, validation = {} } = options

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
      return name.value
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
  const validate = debounce(async () => {
    console.log('validate')
    validating.value = true

    await form.validate(path.value)

    validating.value = false
  }, validation.debounce ?? 300)

  // Create handlers
  const handleInput = (_event: Event = new Event('input')) => {
    // Validate when `on` is not explicitly set to `false` and `on` is undefined/`on` is `input`
    if (
      validation.on !== false &&
      (!isDefined(validation.on) || validation.on === 'input')
    ) {
      validate()
    }
  }
  const handleChange = (event: Event = new Event('change')) => {
    // Only validate when `on` is `change`
    if (validation.on === 'change') {
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
  const handleFocus = () => {
    focused.value = true
  }
  const handleBlur = () => {
    focused.value = false
  }

  // Emit change event when value was changed
  watch(
    () => value.value,
    () => {
      handleChange()
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
    validate: markRaw(validate),
    handleInput: markRaw(handleInput),
    handleChange: markRaw(handleChange),
    handleFocus: markRaw(handleFocus),
    handleBlur: markRaw(handleBlur),
  })
  provideInputContext(context)

  return context
}
