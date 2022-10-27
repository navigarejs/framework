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
  name: 'NavigareApp',

  props: {
    router: {
      type: Object as PropType<Router<DefineComponent>>,
      required: true,
    },

    layout: {
      type: [String, null] as PropType<string | null>,
      required: true,
    },

    Layout: {
      type: Object as PropType<DefineComponent>,
      required: false,
      default: () => DefaultLayout,
    },
  },

  setup(props) {
    const layout = ref<string | null>(props.layout)

    // Handle navigate event to update layout
    const handleNavigate: EventListener<'navigate'> = (event) => {
      console.log('Navigate %o', event.detail)
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
      return h(props.Layout, {
        layout: layout.value,
      })
    }
  },
})
