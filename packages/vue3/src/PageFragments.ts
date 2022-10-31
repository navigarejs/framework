import PageFragment from './PageFragment'
import useRouter from './useRouter'
import isArray from 'lodash.isarray'
import { computed, VNode, defineComponent, h } from 'vue'

export default defineComponent({
  name: 'PageFragments',

  navigare: true,

  props: {
    name: {
      type: String,
      required: true,
    },
  },

  setup(props, { slots }) {
    const router = useRouter()
    const fragments = computed(() => {
      const pageFragments = router.page.fragments[props.name]

      if (!pageFragments) {
        return []
      }

      if (!isArray(pageFragments)) {
        return [pageFragments]
      }

      return pageFragments
    })

    return () => {
      const { default: defaultSlot, fragment: fragmentSlot } = slots

      const renderedFragments = fragments.value.map((fragment) => {
        return h(
          PageFragment,
          {
            name: props.name,
            fragment,
          },
          {
            default: fragmentSlot
              ? (slotProps: { component: VNode }) => {
                  return fragmentSlot(slotProps)
                }
              : null,
          },
        )
      })

      if (defaultSlot) {
        return defaultSlot({
          fragments: renderedFragments,
        })
      }

      return renderedFragments
    }
  },
})
