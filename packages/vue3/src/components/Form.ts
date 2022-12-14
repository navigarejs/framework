import useRouter from './../compositions/useRouter'
import provideFormContext from './../contexts/provideFormContext'
import { FormControl, FormEvent, FormEventListener } from './../types'
import { RawRouteMethod, throwError } from '@navigare/core'
import { computed, onMounted, onUnmounted, PropType, ref } from 'vue'
import { defineComponent, h } from 'vue'

export default defineComponent({
  name: 'Form',

  navigare: true,

  props: {
    form: {
      type: Object as PropType<FormControl>,
      required: true,
    },

    method: {
      type: String as PropType<RawRouteMethod>,
    },
  },

  emits: {
    validate: (_event: FormEvent<'validate'>) => true,
    reset: (_event: FormEvent<'reset'>) => true,
  },

  setup(props, { slots, attrs, emit }) {
    const router = useRouter()
    const element = ref<HTMLElement | null>()
    const target = computed(() => {
      if (!props.form) {
        throwError(
          'You must pass a form (that was created via `createForm`) to the Form component.',
        )
      }

      if (!props.form.routable) {
        return null
      }

      return router.instance.resolveRoutable(
        props.form.routable,
        {},
        {
          method: props.method,
        },
      )
    })

    // Provide context
    provideFormContext(props.form)

    // Emit events
    const handleValidate: FormEventListener<'validate'> = (event) => {
      emit('validate', event)
    }
    const handleReset: FormEventListener<'reset'> = (event) => {
      emit('reset', event)
    }
    onMounted(() => {
      props.form.on('validate', handleValidate)
      props.form.on('reset', handleReset)
    })
    onUnmounted(() => {
      props.form.off('validate', handleValidate)
      props.form.off('reset', handleReset)
    })

    return () => {
      return h(
        'form',
        {
          ref: element,
          method: target.value?.method ?? 'post',
          action: target.value?.location.href ?? '#',
          onReset: (event: Event) => {
            event.preventDefault()

            props.form.reset()
          },
          onSubmit: (event: SubmitEvent) => {
            event.preventDefault()

            props.form.submit({
              trigger: element.value?.querySelector('input[type=submit]:focus'),
            })
          },
          ...attrs,
        },
        slots,
      )
    }
  },
})
