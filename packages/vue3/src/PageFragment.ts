import providePageFragmentContext from './providePageFragmentContext'
import useRouter from './useRouter'
import { PageFragment } from '@navigare/core'
import {
  computed,
  defineAsyncComponent,
  defineComponent,
  h,
  markRaw,
  PropType,
} from 'vue'

export default defineComponent({
  name: 'PageFragment',

  navigare: true,

  props: {
    name: {
      type: String,
      required: true,
    },

    fragment: {
      type: Object as PropType<PageFragment>,
      required: true,
    },
  },

  setup(props, { slots }) {
    const router = useRouter()
    const fragment = computed(() => {
      return props.fragment
    })
    const component = computed(() => {
      return fragment.value.component
    })
    const properties = computed(() => {
      return fragment.value.properties
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

      return markRaw(module)
    })

    // Provide context to children
    providePageFragmentContext(props.name, () => {
      return fragment.value
    })

    return () => {
      const defaultSlot = slots.default

      // Enable inheritance of attributes
      componentModule.value.inheritAttrs = true // !!component.inheritAttrs

      // Render component
      const renderedComponentModule = h(
        componentModule.value,
        {
          ...properties.value,
        },
        {},
      )

      if (defaultSlot) {
        return defaultSlot({
          component: renderedComponentModule,
        })
      }

      return renderedComponentModule
    }
  },
})
