import useRouter from '../compositions/useRouter'
import { RouterControl } from '../types'
import provideFragmentContext from './../contexts/provideFragmentContext'
import { Fragment, safe } from '@navigare/core'
import {
  computed,
  defineAsyncComponent,
  DefineComponent,
  defineComponent,
  h,
  markRaw,
  PropType,
  reactive,
  ref,
  toRefs,
} from 'vue'

export default defineComponent({
  name: 'Fragment',

  navigare: true,

  props: {
    name: {
      type: String,
      required: true,
    },

    fragment: {
      type: Object as PropType<Fragment>,
      required: true,
    },
  },

  setup(props, { slots, attrs, expose }) {
    const context = provideFragmentContext(props.name, () => props.fragment)
    const router = useRouter()
    const properties = computed(() => {
      return {
        ...props.fragment.page?.properties,
        ...props.fragment.properties,
      }
    })
    const component = computed(() => {
      return props.fragment.component
    })
    const componentModule = computed(() => {
      const module = router.instance.getComponentModule(component.value)
      const prepareModule = (module: DefineComponent): DefineComponent => {
        // Disable inheritance of attributes
        safe(() => {
          Object.assign(module, {
            inheritAttrs: false,
          })
        })

        return module
      }

      if (module instanceof Promise) {
        return markRaw(
          defineAsyncComponent({
            loader: async () => {
              return prepareModule(await module)
            },
          }),
        )
      }

      return prepareModule(module)
    })
    const error = ref<Error | null>(null)

    // Expose control
    expose({
      error,
      router,
    })

    return () => {
      if (error.value) {
        if (process.env.NODE_ENV !== 'production') {
          return h(
            'div',
            {
              style: {
                background: '#E83B46',
                color: '#FFFFFF',
                padding: '1rem',
              },
            },
            [
              h(
                'div',
                {
                  style: {
                    fontWeight: 'bold',
                    fontSize: '1.5rem',
                  },
                },
                error.value.message,
              ),
              h(
                'div',
                {
                  style: {
                    fontFamily: 'Consolas, Menlo, monospace',
                  },
                },
                error.value.stack
                  ?.split('\n')
                  .filter((line) => {
                    return !!line.match(/^\s*at .*(\S+:\d+|\(native\))/m)
                  })
                  .map((line) => {
                    const extractLocation = (maybeURL: string) => {
                      // Fail-fast but return locations like "(native)"
                      if (maybeURL.indexOf(':') === -1) {
                        return {
                          url: maybeURL,
                          row: null,
                          column: null,
                        }
                      }

                      const [url, row, column] =
                        /(.+?)(?::(\d+))?(?::(\d+))?$/.exec(
                          maybeURL.replace(/[()]/g, ''),
                        ) ?? ['']
                      return {
                        url,
                        row: Number(row ?? 0),
                        column: Number(column ?? 0),
                      }
                    }

                    if (line.includes('(eval ')) {
                      line = line
                        .replace(/eval code/g, 'eval')
                        .replace(/(\(eval at [^()]*)|(,.*$)/g, '')
                    }

                    let sanitizedLine = line
                      .replace(/^\s+/, '')
                      .replace(/\(eval code/g, '(')
                      .replace(/^.*?\s+/, '')

                    // capture and preserve the parenthesized location "(/foo/my bar.js:12:87)" in
                    // case it has spaces in it, as the string is split on \s+ later on
                    const location = sanitizedLine.match(/ (\(.+\)$)/)

                    // Remove the parenthesized location from the line, if it was matched
                    if (location) {
                      sanitizedLine = sanitizedLine.replace(location[0], '')
                    }

                    // if a location was matched, pass it to extractLocation() otherwise pass all sanitizedLine
                    // because this line doesn't have function name
                    const { url, row, column } = extractLocation(
                      location ? location[1] : sanitizedLine,
                    )
                    const functionName = (location && sanitizedLine) || ''
                    const fileName = ['eval', '<anonymous>'].includes(url)
                      ? ''
                      : safe(
                          () => {
                            return new URL(url).pathname.substring(1)
                          },
                          () => '',
                        )

                    return [
                      h(
                        'div',
                        {
                          style: {},
                        },
                        functionName,
                      ),
                      h(
                        'a',
                        {
                          href: router.generateErrorLink(
                            fileName,
                            row,
                            column,
                            url,
                          ),
                          style: {
                            fontSize: '0.8rem',
                          },
                        },
                        fileName,
                      ),
                    ]
                  }),
              ),
            ],
          )
        }

        return null
      }

      const defaultSlot = slots.default

      // Disable inheritance of attributes
      safe(() => {
        Object.assign(componentModule.value, {
          inheritAttrs: false,
        })
      })

      // Render component
      const renderedComponentModule = h(
        componentModule.value,
        {
          ...attrs,
          key: context.key,
          ...properties.value,
        },
        {},
      )

      if (defaultSlot) {
        return defaultSlot(
          reactive({
            ...toRefs(context),
            properties,
            attrs,
            component: markRaw(renderedComponentModule),
          }),
        )
      }

      return renderedComponentModule
    }
  },

  errorCaptured(error, instance, _info) {
    if (!instance?.$parent) {
      return
    }

    // Inform component about error
    ;(instance.$parent as any).error = error

    // Inform router about error
    if ('router' in instance.$parent) {
      ;(instance.$parent.router as RouterControl).reportError(error)
    }

    return false
  },
})
