import useRouter from '../compositions/useRouter'
import provideFragmentContext from './../contexts/provideFragmentContext'
import { Fragment, safe } from '@navigare/core'
import {
  computed,
  defineAsyncComponent,
  defineComponent,
  h,
  markRaw,
  PropType,
  reactive,
  toRefs,
} from 'vue'

export default defineComponent({
  name: 'Fragment',

  navigare: true,

  props: {
    name: {
      type: String,
      required: true,
    },

    fragment: {
      type: Object as PropType<Fragment>,
      required: true,
    },
  },

  setup(props, { slots, attrs }) {
    const context = provideFragmentContext(props.name, () => props.fragment)
    const router = useRouter()
    const properties = computed(() => {
      return {
        ...props.fragment.page?.properties,
        ...props.fragment.properties,
      }
    })
    const component = computed(() => {
      return props.fragment.component
    })
    const componentModule = computed(() => {
      const module = router.instance.getComponentModule(component.value)

      if (module instanceof Promise) {
        return markRaw(
          defineAsyncComponent(async () => {
            return module
          }),
        )
      }

      return module
    })

    return () => {
      const defaultSlot = slots.default

      // Enable inheritance of attributes
      safe(() => {
        Object.assign(componentModule.value, {
          inheritAttrs: true,
        })
      })

      // Render component
      const renderedComponentModule = h(
        componentModule.value,
        {
          key: context.key,
          ...properties.value,
        },
        {},
      )

      if (defaultSlot) {
        return defaultSlot(
          reactive({
            ...toRefs(context),
            component: markRaw(renderedComponentModule),
          }),
        )
      }

      return renderedComponentModule
    }
  },
})
