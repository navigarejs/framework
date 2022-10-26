import DefaultLayout from './DefaultLayout'
import provideRouterContext from './provideRouterContext'
import { EventListener, Router, RouterOptions } from '@navigare/core'
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
    options: {
      type: Object as PropType<RouterOptions<DefineComponent>>,
      required: true,
    },

    Layout: {
      type: Object as PropType<DefineComponent>,
      required: false,
      default: () => DefaultLayout,
    },
  },

  setup(props) {
    const layout = ref<string | null>(props.options.initialPage.layout)

    // Create instance of router
    const router = new Router<DefineComponent>({
      ...props.options,
    })

    // Handle navigate event to update layout
    const handleNavigate: EventListener<'navigate'> = (event) => {
      console.log('Navigate %o', event.detail)
      layout.value = event.detail.page.layout
    }
    onMounted(() => {
      router.on('navigate', handleNavigate)
    })
    onUnmounted(() => {
      router.off('navigate', handleNavigate)
    })

    // Provide context to children
    provideRouterContext(router)

    return () => {
      return h(props.Layout, {
        layout: layout.value,
      })
    }
  },
})
