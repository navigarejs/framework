import useRouter from './useRouter'
import { RouteParameter, get, isString } from '@navigare/core'
import { computed } from 'vue'

export default function useParameter<TParameter extends RouteParameter>(
  getKey: string | (() => string),
  defaultValue?: TParameter,
) {
  const router = useRouter()
  const key = computed(() => {
    if (isString(getKey)) {
      return getKey
    }

    return getKey()
  })
  const value = computed<TParameter>({
    get: () => {
      return (get(router.parameters, key.value) || defaultValue) as TParameter
    },

    set: (value: TParameter) => {
      router.parameters[key.value] = value
    },
  })

  return value
}
