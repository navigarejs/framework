import useRoutable from '../compositions/useRoutable'
import { ensureFunction, getRouteProp } from './../utilities'
import {
  shouldInterceptLink,
  RawRouteMethod,
  VisitData,
  RouteMethod,
  RouterEvent,
} from '@navigare/core'
import isString from 'lodash.isstring'
import { DefineComponent, normalizeClass, PropType } from 'vue'
import { defineComponent, h } from 'vue'

export default defineComponent({
  name: 'Link',

  navigare: true,

  inheritAttrs: false,

  props: {
    as: {
      type: [String, Object] as PropType<string | DefineComponent>,
    },

    data: {
      type: Object as PropType<VisitData>,
      default: () => ({}),
    },

    href: {
      type: String,
    },

    route: getRouteProp(),

    method: {
      type: String as PropType<RawRouteMethod>,
      default: () => 'GET',
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

    active: {
      type: Boolean,
    },

    activeClass: {
      type: [String, Array, Object],
    },

    inactiveClass: {
      type: [String, Array, Object],
    },

    pendingClass: {
      type: [String, Array, Object],
    },
  },

  emits: {
    click: (_event: MouseEvent) => true,
    before: (_event: RouterEvent<'before'>) => true,
    start: (_event: RouterEvent<'start'>) => true,
    progress: (_event: RouterEvent<'progress'>) => true,
    finish: (_event: RouterEvent<'finish'>) => true,
    cancel: (_event: RouterEvent<'cancel'>) => true,
    success: (_event: RouterEvent<'success'>) => true,
    error: (_event: RouterEvent<'error'>) => true,
  },

  setup(props, { slots, attrs, emit }) {
    const routable = useRoutable(() => props.route, {
      data: () => props.data,
      method: () => props.method,
    })

    if (props.href) {
      console.warn(
        'Pass the `route` prop instead of the `href` attribute to `Link` to ensure proper routing.',
      )
    }

    return () => {
      const as =
        props.as ??
        (routable.method
          ? routable.method === RouteMethod.GET
            ? 'a'
            : 'button'
          : 'a')
      const attributes: {
        href?: string
        rel?: string
      } = {}

      if (isString(as) && as.toLowerCase() === 'a') {
        attributes.href = location?.href
        attributes.rel = routable.foreign ? 'noopener noreferrer' : undefined

        // Warn about issues with non-GET requests
        if (routable.method && routable.method !== RouteMethod.GET) {
          console.warn(
            `Creating POST/PUT/PATCH/DELETE <a> links is discouraged as it causes "Open Link in New Tab/Window" accessibility issues.\n\nPlease specify a more appropriate element using the "as" attribute. For example:\n\n<Link route="${props.route}" method="${routable.method}" as="button">...</Link>`,
          )
        }
      }

      return h(
        as as DefineComponent,
        {
          ...attrs,
          ...attributes,
          'data-pending': routable.pending,
          'data-active': routable.active,
          class: normalizeClass([
            attrs.class,
            routable.active || props.active
              ? props.activeClass
              : props.inactiveClass,
            routable.pending ? props.pendingClass : undefined,
          ]),
          onMouseenter() {
            // Preload components whenever the user hovers a link so
            // we don't lose time when the actual response comes in
            routable.preload()
          },
          onClick: (event: MouseEvent) => {
            if (!props.route || attrs.disabled || !shouldInterceptLink(event)) {
              emit('click', event)
              return
            }

            event.preventDefault()

            routable.visit({
              replace: props.replace,
              preserveScroll: props.preserveScroll,
              preserveState:
                props.preserveState ??
                routable.method?.toUpperCase() !== RouteMethod.GET,
              properties: props.properties,
              headers: props.headers,
              events: {
                before: ensureFunction(attrs.onBefore),
                start: ensureFunction(attrs.onStart),
                progress: ensureFunction(attrs.onProgress),
                finish: ensureFunction(attrs.onFinish),
                cancel: ensureFunction(attrs.onCancel),
                success: ensureFunction(attrs.onSuccess),
                error: ensureFunction(attrs.onError),
              },
            })
          },
        },
        slots,
      )
    }
  },
})
