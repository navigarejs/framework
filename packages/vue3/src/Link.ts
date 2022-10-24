import type { PropType } from 'vue'
import { defineComponent, h } from 'vue'
import {
  shouldInterceptLink,
  RawRouteMethod,
  Routable,
  throwError,
  PartialRoute,
  RouteName,
  RouteMethod,
} from '@navigare/core'
import isFunction from 'lodash.isfunction'
import useRouter from './useRouter'
import isArray from 'lodash.isarray'

const ensureFunction = (func: unknown): (() => void) | undefined => {
  if (!isFunction(func)) {
    return undefined
  }

  return (...args: unknown[]) => {
    func(...args)
  }
}

export default defineComponent({
  name: 'NavigareLink',

  props: {
    as: {
      type: String,
      default: 'a',
    },

    data: {
      type: Object,
      default: () => ({}),
    },

    route: {
      type: [String, Object, Array] as PropType<
        Routable | [Routable, ...PartialRoute<RouteName>[]]
      >,
      required: true,
    },

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

    props: {
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
          'a valid `route` must be set on Link, did you forget to set the prop?',
        )
      }

      const { method, href } = router.instance.resolveRoutable(
        routable,
        props.data,
        {
          method: props.method,
        },
      )

      if (as === 'a' && method !== RouteMethod.GET) {
        console.warn(
          `Creating POST/PUT/PATCH/DELETE <a> links is discouraged as it causes "Open Link in New Tab/Window" accessibility issues.\n\nPlease specify a more appropriate element using the "as" attribute. For example:\n\n<Link route="${props.route}" method="${method}" as="button">...</Link>`,
        )
      }

      const matches = (isArray(props.route) ? props.route : [props.route]).some(
        (route) => {
          return router.matches(route)
        },
      )

      return h(
        props.as,
        {
          ...attrs,
          class: matches ? props.activeClass ?? attrs.class : attrs.class,
          ...(as === 'a'
            ? {
                href,
              }
            : {}),
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
              props: props.props,
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
