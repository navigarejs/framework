import provideFormContext from './provideFormContext'
import { FormControl, FormError } from './types'
import useForm from './useForm'
import {
  isDefined,
  throwError,
  debounce,
  get,
  isArray,
  isString,
  set,
} from '@navigare/core'
import {
  computed,
  PropType,
  Ref,
  ref,
  vModelDynamic,
  watch,
  withDirectives,
} from 'vue'
import { defineComponent, h } from 'vue'

export default defineComponent({
  name: 'Input',

  navigare: true,

  props: {
    form: {
      type: Object as PropType<FormControl>,
    },

    name: {
      type: [String, Number] as PropType<string | number>,
      required: true,
    },

    type: {
      type: String,
      default: () => 'text',
    },

    validation: {
      type: Object as PropType<{
        on?: 'input' | 'change' | false
        debounce?: number
      }>,
      default: () => ({}),
    },
  },

  emits: {
    input: (_event: Event) => true,
    change: (_event: Event) => true,
  },

  setup(props, { slots, attrs, emit }) {
    const form = useForm()
    const element = ref<HTMLObjectElement | null>()
    const resolvedForm = computed<FormControl>(() => {
      const maybeForm = props.form || form

      if (!maybeForm) {
        throwError(
          'You must either nest the Input within a Form component or pass a form (that was created via `createForm`) to the Input component.',
        )
      }

      return maybeForm
    })
    const checkValue = () => {
      if (!(props.name in resolvedForm.value.values)) {
        throwError(`"${props.name}" is not defined in initial values of form.`)
      }
    }
    const value = computed({
      get: () => {
        checkValue()

        return get(resolvedForm.value.values, props.name)
      },
      set: (nextValue) => {
        checkValue()

        set(resolvedForm.value.values, props.name, nextValue)
      },
    })
    const errors = computed(() => {
      return get(resolvedForm.value.errors, props.name)
    })
    const errorMessage = computed(() => {
      if (isArray(errors.value)) {
        return errors.value?.join('')
      }

      if (isString(errors.value)) {
        return errors.value
      }

      return ''
    })
    const validating = ref(false)
    const validate = debounce(async () => {
      console.log('validate')
      validating.value = true

      await resolvedForm.value.validate(props.name)

      validating.value = false
    }, props.validation?.debounce ?? 300)
    const focused = ref(false)

    // Provide context
    provideFormContext(resolvedForm.value)

    // Set validation message
    watch(
      () => errorMessage.value,
      (nextErrorMessage) => {
        if (!!slots.feedback) {
          return
        }

        element.value?.setCustomValidity(nextErrorMessage)

        if (nextErrorMessage && focused.value) {
          element.value?.reportValidity()
        }
      },
      {
        immediate: true,
      },
    )

    // Display validation message when focused
    watch(
      () => focused.value,
      (nextFocused) => {
        if (!nextFocused) {
          return
        }

        // Wait for the next validation first
        if (validating.value) {
          return
        }

        element.value?.reportValidity()
      },
      {
        immediate: true,
      },
    )

    // Validate when value was changed (programmatically)
    const handleInput = (event: Event = new Event('input')) => {
      emit('input', event)

      // Validate when `on` is not explicitly set to `false` and `on` is undefined/`on` is `input`
      if (
        props.validation.on !== false &&
        (!isDefined(props.validation.on) || props.validation.on === 'input')
      ) {
        validate()
      }
    }
    const handleChange = (event: Event = new Event('change')) => {
      emit('change', event)

      // Only validate when `on` is `change`
      if (props.validation.on === 'change') {
        validate()
      }

      // File input do not work with v-model so this is the workaround
      if (
        event.target instanceof HTMLInputElement &&
        event.target.type === 'file'
      ) {
        value.value = event.target.files?.[0]
      }
    }
    watch(
      () => value.value,
      () => {
        handleChange()
      },
    )

    return () => {
      const defaultSlot = slots.default
      const ref = element
      const attributes: {
        id: string | undefined
        name: string | undefined
        disabled: boolean
      } = {
        ...attrs,
        id: resolvedForm.value?.getInputId(props.name),
        name: resolvedForm.value?.getInputName(props.name),
        disabled: !!(
          resolvedForm.value?.processing || resolvedForm.value?.disabled
        ),
      }
      const events: {
        onFocus: () => void
        onBlur: () => void
        onInput: (event: Event) => void
        onChange: (event: Event) => void
      } = {
        onFocus: () => {
          focused.value = true
        },
        onBlur: () => {
          focused.value = false
        },
        onInput: (event: Event) => {
          handleInput(event)
        },
        onChange: (event: Event) => {
          handleChange(event)
        },
      }
      const slotProps: {
        form: FormControl
        value: Ref<any>
        ref: Ref<HTMLObjectElement | null | undefined>
        attributes: {
          id: string | undefined
          name: string | undefined
          disabled: boolean
        }
        events: {
          onFocus: () => void
          onBlur: () => void
          onInput: (event: Event) => void
          onChange: (event: Event) => void
        }
        errors: FormError
      } = {
        form: resolvedForm.value,
        value,
        ref,
        attributes,
        events,
        errors: errors.value,
      }

      // Render slot if one was passed
      if (defaultSlot) {
        return defaultSlot(slotProps)
      }

      // Render simple input
      return [
        slots.label?.(slotProps),

        withDirectives(
          h(
            'input',
            {
              ref,
              type: props.type,
              ...attributes,
              ...events,
              'onUpdate:modelValue': (nextValue: any) => {
                value.value = nextValue
              },
            },
            slots,
          ),
          props.type !== 'file' ? [[vModelDynamic, value.value]] : [],
        ),

        slots.feedback?.(slotProps),
      ]
    }
  },
})
