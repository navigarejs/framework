import { DeferredProperty, isDeferred } from '@navigare/core'
import { defineComponent, PropType } from 'vue'

export default defineComponent({
  name: 'Deferred',

  navigare: true,

  props: {
    value: {
      type: [Array, Object] as PropType<DeferredProperty>,
      required: true,
    },
  },

  setup(props, { slots }) {
    return () => {
      if (isDeferred(props.value)) {
        return slots.fallback?.()
      }

      return slots.default?.()
    }
  },
})
