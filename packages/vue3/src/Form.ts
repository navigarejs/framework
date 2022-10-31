import { FormControl } from './types'
import useRouter from './useRouter'
import { RawRouteMethod, VisitData } from '@navigare/core'
import { computed, PropType, ref } from 'vue'
import { defineComponent, h } from 'vue'

export default defineComponent({
  name: 'Form',

  props: {
    form: {
      type: Object as PropType<FormControl<VisitData>>,
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
      return router.instance.resolveRoutable(
        props.form.routable,
        {},
        {
          method: props.method,
        },
      )
    })

    return () => {
      return h(
        'form',
        {
          ref: element,
          method: target.value.method,
          action: target.value.location.href,
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
