import PageFragmentVue from './PageFragment'
import { PageFragmentContext } from './providePageFragmentContext'
import { ContextOf } from './types'
import useRouter from './useRouter'
import { isDefined, isNotNull, PageFragment } from '@navigare/core'
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

      const renderFragment = (fragment: PageFragment) => {
        return h(
          PageFragmentVue,
          {
            // key: `${fragment.component.uri}-${fragment.location.url}`,
            name: props.name,
            fragment,
          },
          {
            default: fragmentSlot
              ? (
                  slotProps: ContextOf<typeof PageFragmentContext> & {
                    component: VNode
                    key: string
                  },
                ) => {
                  return fragmentSlot(slotProps)
                }
              : null,
          },
        )
      }

      if (defaultSlot) {
        return defaultSlot({
          fragments: fragments.value.map((fragment) => {
            return {
              ...fragment,
              component: renderFragment(fragment),
            }
          }),
        })
      }

      return fragments.value.map(renderFragment)
    }
  },
})
