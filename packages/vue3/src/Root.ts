import DefaultLayout from './DefaultLayout'
import provideRouterContext from './provideRouterContext'
import { EventListener, Router } from '@navigare/core'
import {
  defineComponent,
  h,
  PropType,
  DefineComponent,
  ref,
  onMounted,
  onUnmounted,
} from 'vue'

export default defineComponent({
  name: 'Root',

  navigare: true,

  props: {
    router: {
      type: Object as PropType<Router<DefineComponent>>,
      required: true,
    },

    layout: {
      type: [String, null] as PropType<string | null>,
      required: true,
    },
  },

  setup(props, { slots }) {
    const layout = ref<string | null>(props.layout)

    // Handle navigate event to update layout
    const handleNavigate: EventListener<'navigate'> = (event) => {
      layout.value = event.detail.page.layout
    }
    onMounted(() => {
      props.router.on('navigate', handleNavigate)
    })
    onUnmounted(() => {
      props.router.off('navigate', handleNavigate)
    })

    // Provide context to children
    provideRouterContext(props.router)

    return () => {
      if (slots.default) {
        return slots.default?.({
          layout: layout.value,
        })
      }

      return h(DefaultLayout, {
        layout: layout.value,
      })
    }
  },
})
