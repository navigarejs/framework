import useRouter from './../compositions/useRouter'
import { FragmentContext } from './../contexts/provideFragmentContext'
import { ContextOf } from './../types'
import FragmentVue from './Fragment'
import { isDefined, isNotNull, Fragment, castArray } from '@navigare/core'
import { computed, VNode, defineComponent, h } from 'vue'

export default defineComponent({
  name: 'Fragments',

  navigare: true,

  props: {
    name: {
      type: String,
      default: () => 'default',
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

      const renderFragment = (fragment: Fragment) => {
        return h(
          FragmentVue,
          {
            // key: `${fragment.component.uri}-${fragment.location.url}`,
            name: props.name,
            fragment,
          },
          {
            default: fragmentSlot
              ? (
                  slotProps: ContextOf<typeof FragmentContext> & {
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
