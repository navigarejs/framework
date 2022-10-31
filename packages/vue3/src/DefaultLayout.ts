import PageFragments from './PageFragments'
import { defineComponent, h, PropType } from 'vue'

export default defineComponent({
  name: 'DefaultLayout',

  props: {
    layout: {
      type: [String, null] as PropType<string | null>,
      required: true,
    },
  },

  setup() {
    return () => {
      const renderSlot = (name: string) => {
        return h(PageFragments, {
          name,
        })
      }

      return [renderSlot('default'), renderSlot('modal')]
    }
  },
})
