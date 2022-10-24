import {
  defineComponent,
  h,
  PropType,
  DefineComponent,
  ref,
  onMounted,
  onUnmounted,
} from 'vue'
import { EventListener, Router, RouterOptions } from '@navigare/core'
import provideRouterContext from './provideRouterContext'
import DefaultLayout from './DefaultLayout'

export default defineComponent({
  name: 'NavigareApp',

  props: {
    options: {
      type: Object as PropType<RouterOptions<DefineComponent>>,
      required: true,
    },

    layoutComponent: {
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
      return h(props.layoutComponent, {
        layout: layout.value,
      })
    }
  },
})
