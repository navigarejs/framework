import useRouter from './useRouter'
import { RouteParameter } from '@navigare/core'
import get from 'lodash.get'
import { computed } from 'vue'

export default function useParameter<TParameter extends RouteParameter>(
  key: string,
  defaultValue?: TParameter,
) {
  const router = useRouter()
  const value = computed<TParameter>({
    get: () => {
      return (get(router.parameters, key) || defaultValue) as TParameter
    },

    set: (value: TParameter) => {
      router.parameters[key] = value
    },
  })

  return value
}
