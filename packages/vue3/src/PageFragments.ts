import PageFragment from './PageFragment'
import useRouter from './useRouter'
import { isDefined, isNotNull } from '@navigare/core'
import castArray from 'lodash.castarray'
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
      return castArray(router.page.fragments[props.name])
        .filter(isDefined)
        .filter(isNotNull)
    })

    return () => {
      const { default: defaultSlot, fragment: fragmentSlot } = slots

      const renderedFragments = fragments.value.map((fragment) => {
        return h(
          PageFragment,
          {
            // key: `${fragment.component.uri}-${fragment.location.url}`,
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
