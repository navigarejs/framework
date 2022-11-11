import useRouter from './useRouter'
import {
  RawRouteMethod,
  isDefined,
  VisitData,
  Routable,
  PartialRoute,
  VisitOptions,
} from '@navigare/core'
import castArray from 'lodash.castarray'
import isArray from 'lodash.isarray'
import { computed, PropType, ref } from 'vue'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'Routable',

  navigare: true,

  props: {
    route: {
      type: [String, Object, Array] as PropType<
        (Routable | PartialRoute) | (Routable | PartialRoute)[]
      >,
    },

    data: {
      type: Object as PropType<VisitData>,
      default: () => ({}),
    },

    method: {
      type: String as PropType<RawRouteMethod>,
      default: () => 'GET',
    },
  },

  setup(props, { slots }) {
    const router = useRouter()
    const routable = computed(() => {
      return isArray(props.route) ? props.route[0] : props.route
    })
    const resolvedRoutable = computed(() => {
      if (!router.instance.isRoutable(routable.value)) {
        return {
          method: undefined,
          location: undefined,
          components: undefined,
        }
      }

      return router.instance.resolveRoutable(routable.value, props.data, {
        method: props.method,
      })
    })
    const foreign = computed(() => {
      const { location } = resolvedRoutable.value

      return location?.origin && location?.origin !== router.location.origin
    })
    const active = computed(() => {
      // Check if the passed route matches the current location
      return castArray(props.route)
        .filter(isDefined)
        .some((route) => {
          const matches = router.matches(route)

          return matches
        })
    })
    const navigating = ref(false)

    // Create handlers
    const preload = async () => {
      const { components = [] } = resolvedRoutable.value

      await Promise.all(
        components.map((component) => {
          return router.instance.getComponentModule(component)
        }),
      )
    }
    const visit = async (options: VisitOptions = {}) => {
      if (!router.instance.isRoutable(routable.value)) {
        return
      }

      navigating.value = true

      await router.instance.visit(routable.value, {
        ...options,
        data: props.data,
        method: resolvedRoutable.value.method,
      })

      navigating.value = false
    }

    return () => {
      return slots.default?.({
        routable: resolvedRoutable.value,
        active: active.value,
        foreign: foreign.value,
        method: resolvedRoutable.value.method,
        components: resolvedRoutable.value.components,
        location: resolvedRoutable.value.location,
        preload,
        visit,
        navigating: navigating.value,
      })
    }
  },
})
