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
                  .slice(1)
                  .map((line) => {
                    const [at, location] = line.split('(')
                    const parts = location.slice(0, -1).split(':')
                    const url = parts.slice(0, -2).join(':')
                    const { pathname: file } = new URL(url)
                    const row = Number(parts[parts.length - 2])
                    const column = Number(parts[parts.length - 1])

                    return [
                      h(
                        'div',
                        {
                          style: {},
                        },
                        at,
                      ),
                      h(
                        'a',
                        {
                          href: router.generateErrorLink(
                            file,
                            row,
                            column,
                            url,
                          ),
                          style: {
                            fontSize: '0.8rem',
                          },
                        },
                        file.slice(1),
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
    Object.assign(instance.$parent, {
      error,
    })

    // Inform router about error
    if ('router' in instance.$parent) {
      ;(instance.$parent.router as RouterControl).reportError(error)
    }
  },
})
