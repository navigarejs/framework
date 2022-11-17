import useRouter from './useRouter'
import { Page } from '@navigare/core'

export default function usePage(): Page {
  const router = useRouter()

  return router.page
}
