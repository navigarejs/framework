import RoutableVue from './Routable'
import { ensureFunction, getRouteProp } from './utilities'
import {
  shouldInterceptLink,
  RawRouteMethod,
  VisitData,
  Routable,
  RouteMethod,
  PageComponent,
  RouterLocation,
  VisitOptions,
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
    if (props.href) {
      console.warn(
        'Pass the `route` prop instead of the `href` attribute to `Link` to ensure proper routing.',
      )
    }

    return () => {
      return h(
        RoutableVue,
        {
          route: props.route,
          data: props.data,
          method: props.method,
        },
        {
          default: ({
            active,
            foreign,
            method,
            location,
            preload,
            visit,
            navigating: pending,
          }: {
            routable: Routable
            active: boolean
            foreign: boolean
            method: RouteMethod | undefined
            components: PageComponent[] | undefined
            location: RouterLocation | undefined
            preload: () => Promise<void>
            visit: (options?: VisitOptions) => Promise<void>
            navigating: boolean
          }) => {
            const as =
              props.as ||
              (method ? (method.toUpperCase() === 'GET' ? 'a' : 'button') : 'a')

            // Warn about issues with non-GET requests
            if (
              isString(as) &&
              as.toLowerCase() === 'a' &&
              method &&
              method.toUpperCase() !== 'GET'
            ) {
              console.warn(
                `Creating POST/PUT/PATCH/DELETE <a> links is discouraged as it causes "Open Link in New Tab/Window" accessibility issues.\n\nPlease specify a more appropriate element using the "as" attribute. For example:\n\n<Link route="${props.route}" method="${method}" as="button">...</Link>`,
              )
            }

            // Render fallback if required
            if (!location?.href && slots.default) {
              return slots.default()
            }

            return h(
              as as DefineComponent,
              {
                ...attrs,
                'data-pending': pending,
                'data-active': active,
                class: normalizeClass([
                  attrs.class,
                  active || props.active
                    ? props.activeClass
                    : props.inactiveClass,
                  pending ? props.pendingClass : undefined,
                ]),
                href: location?.href,
                rel: foreign ? 'noopener noreferrer' : undefined,
                onMouseenter() {
                  // Preload components whenever the user hovers a link so
                  // we don't lose time when the actual response comes in
                  preload()
                },
                onClick: (event: MouseEvent) => {
                  if (
                    !props.route ||
                    attrs.disabled ||
                    !shouldInterceptLink(event)
                  ) {
                    emit('click', event)
                    return
                  }

                  event.preventDefault()

                  visit({
                    replace: props.replace,
                    preserveScroll: props.preserveScroll,
                    preserveState:
                      props.preserveState ?? method?.toUpperCase() !== 'GET',
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
          },
        },
      )
    }
  },
})
