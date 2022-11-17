import useInput from './../compositions/useInput'
import { FormControl, FormError, FormInputName, FormValue } from './../types'
import {
  PropType,
  Ref,
  ref,
  toRef,
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
      type: [String, Number] as PropType<FormInputName>,
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

  setup(props, { slots, attrs, emit }) {
    const input = useInput(() => props.name, {
      form: props.form,
      validation: props.validation,
    })
    const element = ref<HTMLObjectElement | null>()

    // Set validation message
    watch(
      () => input.feedback,
      (nextFeedback) => {
        if (!!slots.feedback) {
          return
        }

        element.value?.setCustomValidity(nextFeedback)

        if (nextFeedback && input.focused) {
          element.value?.reportValidity()
        }
      },
      {
        immediate: true,
      },
    )

    // Display validation message when focused
    watch(
      () => input.focused,
      (nextFocused) => {
        if (!nextFocused) {
          return
        }

        // Wait for the next validation first
        if (input.validating) {
          return
        }

        element.value?.reportValidity()
      },
      {
        immediate: true,
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
        id: input.form.getInputId(props.name),
        name: input.form.getInputName(props.name),
        disabled: !!(input.form.processing || input.form.disabled),
      }
      const events: {
        onFocus: (event: Event) => void
        onBlur: (event: Event) => void
        onInput: (event: Event) => void
        onChange: (event: Event) => void
      } = {
        onFocus: (event) => {
          emit('focus', event)
          input.handleFocus(event)
        },
        onBlur: (event) => {
          emit('blur', event)
          input.handleBlur(event)
        },
        onInput: (event: Event) => {
          emit('input', event)
          input.handleInput(event)
        },
        onChange: (event: Event) => {
          emit('change', event)
          input.handleChange(event)
        },
      }
      const slotProps: {
        form: FormControl
        value: Ref<FormValue>
        ref: Ref<HTMLObjectElement | null | undefined>
        attributes: {
          id: string | undefined
          name: string | undefined
          disabled: boolean
        }
        events: typeof events
        errors: FormError
      } = {
        form: input.form,
        value: toRef(input, 'value'),
        ref,
        attributes,
        events,
        errors: input.errors,
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
                input.value = nextValue
              },
            },
            slots,
          ),
          props.type !== 'file' ? [[vModelDynamic, input.value]] : [],
        ),

        slots.feedback?.(slotProps),
      ]
    }
  },
})
