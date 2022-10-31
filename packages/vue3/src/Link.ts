import useRouter from './useRouter'
import { getRouteProp } from './utilities'
import {
  shouldInterceptLink,
  RawRouteMethod,
  throwError,
  RouteMethod,
} from '@navigare/core'
import castArray from 'lodash.castarray'
import isArray from 'lodash.isarray'
import isFunction from 'lodash.isfunction'
import type { DefineComponent, PropType } from 'vue'
import { defineComponent, h } from 'vue'

const ensureFunction = (func: unknown): (() => void) | undefined => {
  if (!isFunction(func)) {
    return undefined
  }

  return (...args: unknown[]) => {
    func(...args)
  }
}

export default defineComponent({
  name: 'Link',

  navigare: true,

  props: {
    as: {
      type: [String, Object] as PropType<string | DefineComponent>,
      default: 'a',
    },

    data: {
      type: Object,
      default: () => ({}),
    },

    route: getRouteProp(),

    method: {
      type: String as PropType<RawRouteMethod>,
    },

    replace: {
      type: Boolean,
      default: false,
    },

    preserveScroll: {
      type: Boolean,
      default: false,
    },

    preserveState: {
      type: Boolean,
      default: null,
    },

    properties: {
      type: Array as PropType<string[]>,
      default: () => [],
    },

    headers: {
      type: Object,
      default: () => ({}),
    },

    queryStringArrayFormat: {
      type: String,
      default: 'brackets',
    },

    activeClass: {
      type: String,
    },
  },

  setup(props, { slots, attrs }) {
    const router = useRouter()

    return () => {
      const as = props.as.toLowerCase()
      const routable = isArray(props.route) ? props.route[0] : props.route

      if (!routable) {
        throwError(
          'a valid `route` must be set on Link, did you forget to set the property?',
        )
      }

      // Resolve routable
      const { method, location, components } = router.instance.resolveRoutable(
        routable,
        props.data,
        {
          method: props.method,
        },
      )
      const foreign = location.origin !== router.location.origin

      // Warn about issues with non-GET requests
      if (as === 'a' && method !== RouteMethod.GET) {
        console.warn(
          `Creating POST/PUT/PATCH/DELETE <a> links is discouraged as it causes "Open Link in New Tab/Window" accessibility issues.\n\nPlease specify a more appropriate element using the "as" attribute. For example:\n\n<Link route="${props.route}" method="${method}" as="button">...</Link>`,
        )
      }

      // Check if the passed route matches the current location
      const matches = castArray(props.route).some((route) => {
        return router.matches(route)
      })

      return h(
        props.as as DefineComponent,
        {
          ...attrs,
          class: matches ? props.activeClass ?? attrs.class : attrs.class,
          href: location.href,
          rel: foreign ? 'noopener noreferrer' : undefined,
          onMouseenter() {
            // Preload components whenever the user hovers a link so
            // we don't lose time when the actual response comes in
            Promise.all(
              components.map((component) => {
                return router.instance.resolveComponent(component)
              }),
            )
          },
          onClick: (event: MouseEvent) => {
            if (!shouldInterceptLink(event)) {
              return
            }

            event.preventDefault()

            router.instance.visit(routable, {
              data: props.data,
              method: props.method,
              replace: props.replace,
              preserveScroll: props.preserveScroll,
              preserveState: props.preserveState ?? method !== 'get',
              properties: props.properties,
              headers: props.headers,
              onBefore: ensureFunction(attrs.onBefore),
              onStart: ensureFunction(attrs.onStart),
              onProgress: ensureFunction(attrs.onProgress),
              onFinish: ensureFunction(attrs.onFinish),
              onCancel: ensureFunction(attrs.onCancel),
              onSuccess: ensureFunction(attrs.onSuccess),
              onError: ensureFunction(attrs.onError),
            })
          },
        },
        slots,
      )
    }
  },
})
