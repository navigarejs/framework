import { injectFormContext } from '../contexts/injectFormContext'
import { FormControl } from '../types'

export default function useForm(): FormControl | null {
  const { form } = injectFormContext()

  return form
}
