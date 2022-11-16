import provideFormContext from './provideFormContext'
import { FormControl } from './types'
import useRouter from './useRouter'
import { RawRouteMethod, throwError } from '@navigare/core'
import { computed, PropType, ref } from 'vue'
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

  setup(props, { slots, attrs }) {
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
