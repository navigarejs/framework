import providePageFragmentContext from './providePageFragmentContext'
import useRouter from './useRouter'
import { PageFragment } from '@navigare/core'
import { defineComponent, h, PropType } from 'vue'

export default defineComponent({
  name: 'PageFragmentContext',

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

    // Provide context to children
    providePageFragmentContext(() => {
      return props.fragment
    })

    return () => {
      const defaultSlot = slots.default

      // Get component
      const component = router.components[props.fragment.component]

      // This case sometimes happens when the component is updated but not yet loaded
      if (!component) {
        return null
      }

      // Enable inheritance of attributes
      component.inheritAttrs = true // !!component.inheritAttrs

      // Render component
      const renderedComponent = h(
        component,
        {
          ...props.fragment.props,
        },
        {},
      )

      if (defaultSlot) {
        return defaultSlot({
          component: renderedComponent,
        })
      }

      return renderedComponent
    }
  },
})
