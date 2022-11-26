import { injectRouterContext } from '../contexts/injectRouterContext'
import { Page, RouterEventListener, cloneDeep } from '@navigare/core'
import { onMounted, onUnmounted, reactive } from 'vue'

export default function usePage(): Page {
  const { router } = injectRouterContext()
  const page = reactive(router.page)

  const handleNavigate: RouterEventListener<'navigate'> = (event) => {
    Object.assign(page, cloneDeep(event.detail.page))
  }
  onMounted(() => {
    router.on('navigate', handleNavigate)
  })
  onUnmounted(() => {
    router.off('navigate', handleNavigate)
  })

  return page
}
