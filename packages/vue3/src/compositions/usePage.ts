import useRouter from './useRouter'
import { Page } from '@navigare/core'
import { computed, reactive, toRefs } from 'vue'

export default function usePage(): Page {
  const router = useRouter()
  const page = computed(() => {
    return router.page
  })

  return reactive({
    ...toRefs(page.value),
  })
}
