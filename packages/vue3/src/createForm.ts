import {
  FormControl,
  FormErrors,
  FormEventListener,
  FormEventNames,
  FormEvents,
  FormOptions,
  FormTrigger,
  FormVisitOptions,
} from './types'
import useRouter from './useRouter'
import {
  VisitData,
  Routable,
  VisitProgress,
  getKeys,
  isDefined,
  createEmitter,
} from '@navigare/core'
import castArray from 'lodash.castarray'
import cloneDeep from 'lodash.clonedeep'
import isEqual from 'lodash.isequal'
import isFunction from 'lodash.isfunction'
import set from 'lodash.set'
import { computed, markRaw, reactive, ref, watch } from 'vue'

const globalDisabled = ref(false)

export default function createForm<
  TValues extends VisitData = VisitData,
  TRoutable extends Routable = never,
>(
  getName: string | (() => string),
  getRoutable:
    | TRoutable
    | (() => TRoutable)
    | (() => (values: TValues) => any | Promise<any>),
  getInitialValues: TValues | (() => TValues),
  options: FormOptions<TValues, TRoutable> = {},
): FormControl<TValues> {
  const name = computed(() => {
    if (isFunction(getName)) {
      return getName()
    }

    return getName
  })
  const emitter = createEmitter<FormEvents<TValues>>({
    validate: {
      options: {
        cancelable: true,
      },
    },
  })
  const router = useRouter()
  const routable = computed(() => {
    if (isFunction(getRoutable)) {
      const routable = getRoutable()

      if (isFunction(routable)) {
        return null
      }

      return routable
    }

    return getRoutable
  })
  const callback = computed(() => {
    if (!isFunction(getRoutable)) {
      return null
    }

    const routable = getRoutable()
    if (!isFunction(routable)) {
      return null
    }

    return routable
  })
  const initialValues = computed<TValues>(() => {
    const restoredValues = router.instance.restore(name.value)
    if (options.remember && restoredValues) {
      return restoredValues as TValues
    }

    if (isFunction(getInitialValues)) {
      return getInitialValues()
    }

    return getInitialValues
  })
  const values = reactive(cloneDeep(initialValues.value))
  const errors = ref<FormErrors>({})
  const dirty = computed(() => {
    return isEqual(initialValues.value, values)
  })
  const processing = ref(false)
  const progress = ref<VisitProgress | null>(null)
  const trigger = ref<FormTrigger>(null)
  const blockers = ref<Record<string, boolean>>({})
  const blocked = computed(() => {
    return getKeys(blockers.value).some((key) => {
      return !!blockers.value[key]
    })
  })
  const focus = ref<string | null>(null)
  const manualDisabled = ref(false)
  const computedDisabled = computed(() => {
    if (isFunction(options.disabled)) {
      return options.disabled()
    }

    return options.disabled
  })
  const disabled = computed(() => {
    return (
      manualDisabled.value || computedDisabled.value || globalDisabled.value
    )
  })
  const validationRequests: Record<
    string,
    {
      abortController?: AbortController
      request: () => void
    }
  > = {}

  // Remember values
  watch(
    () => values,
    (nextValues) => {
      if (!options.remember) {
        return
      }

      router.instance.remember(nextValues, name.value)
    },
    { deep: true },
  )

  // Expose control
  const control: FormControl<TValues> = reactive({
    name,

    values: values as any,

    routable,

    errors,

    dirty,

    blocked,

    blockers,

    processing,

    disabled,

    progress,

    trigger,

    submit: markRaw(
      async (
        submitOptions = {
          trigger: null,
          resetAfterSuccess: true,
        },
      ) => {
        if (disabled.value || blocked.value) {
          return
        }

        // Indicate processing state
        processing.value = true
        globalDisabled.value = true

        // Remember which element triggered the submission
        trigger.value = submitOptions.trigger ?? null

        // Transform values before submission if required
        const clonedValues = cloneDeep(values) as TValues
        const transform = options.transform || ((values) => values)

        // Run `validate` hook
        if (
          !emitter.emit('validate', {
            values: clonedValues,
          })
        ) {
          return undefined
        }

        // Submit via callback
        if (callback.value) {
          await callback.value(clonedValues)

          return undefined
        }

        // ... or submit via route
        if (routable.value) {
          const visitOptions = options as FormVisitOptions<TValues>
          const visit = await router.instance.visit(routable.value, {
            data: transform(clonedValues),

            events: {
              progress(event) {
                progress.value = event.detail.progress ?? null

                visitOptions.events?.progress?.(event)
              },

              error(event) {
                errors.value = event.detail.errors

                visitOptions.events?.error?.(event)
              },

              success(event) {
                // Reset errors
                errors.value = {}

                // Reset values if requested
                if (submitOptions.resetAfterSuccess) {
                  control.reset()
                }

                visitOptions.events?.success?.(event)
              },

              finish(event) {
                processing.value = false
                globalDisabled.value = false
                trigger.value = null

                visitOptions.events?.finish?.(event)
              },

              before(event) {
                visitOptions.events?.before?.(event)
              },

              cancel(event) {
                visitOptions.events?.cancel?.(event)
              },

              start(event) {
                visitOptions.events?.start?.(event)
              },

              invalid(event) {
                processing.value = false
                globalDisabled.value = false
                trigger.value = null

                visitOptions.events?.invalid?.(event)
              },

              exception(event) {
                processing.value = false
                globalDisabled.value = false
                trigger.value = null

                visitOptions.events?.exception?.(event)
              },
            },
          })

          return visit
        }

        return undefined
      },
    ),

    validate: markRaw(async (path) => {
      let validationErrors: FormErrors = {}
      const name = control.getInputName(path)

      // Run one validation at a time for the given path
      validationRequests[name] = validationRequests[name] ?? {
        request: async () => {
          if (!routable.value) {
            return
          }

          const validationRequest = validationRequests[name]

          // Cancel potential previous request
          validationRequest?.abortController?.abort()

          // Call back-end with precognition mode
          try {
            // Remove files from values
            const sanitizedValues = Object.fromEntries(
              Object.entries(cloneDeep(values))
                .map(([name, value]) => {
                  if (value instanceof Blob) {
                    return undefined
                  }

                  return [name, value]
                })
                .filter(isDefined),
            )

            // Stop unnecessary requests early
            if (
              !getKeys(sanitizedValues).length ||
              !(name in sanitizedValues)
            ) {
              return
            }

            // Run request with Precognition header
            const abortController = new AbortController()
            validationRequest.abortController = abortController

            const { method, location, data } = router.instance.resolveRoutable(
              routable.value,
              sanitizedValues,
            )

            await router.instance.axios({
              method,
              data,
              url: location.href,
              headers: {
                Precognition: true,
                'Precognition-Validate-Only': name,
              },
              signal: abortController.signal,
            })

            // Clear previous errors if this validation was successful
            if (name) {
              set(errors.value, name, [])
            } else {
              errors.value = {}
            }

            // Clear request
            delete validationRequests[name].abortController
          } catch (error) {
            if (router.instance.axios.isAxiosError(error)) {
              if (error.code === 'ERR_CANCELED') {
                // Ignore
              } else {
                const { response } = error

                validationErrors = response?.data.errors ?? {}
                for (const [key, messages] of Object.entries(
                  validationErrors,
                )) {
                  errors.value[key] = messages
                }
              }
            } else {
              throw error
            }
          }
        },
      }

      // Call debounced request
      await validationRequests[name]?.request()
    }),

    reset: markRaw(() => {
      errors.value = {}

      control.set(initialValues.value)

      emitter.emit('reset', {})
    }),

    clear: markRaw(() => {
      control.set()
    }),

    set: markRaw((nextValues) => {
      if (!nextValues) {
        for (const key of getKeys(values)) {
          delete values[key]
        }

        return
      }

      for (const key of getKeys(nextValues)) {
        Object.assign(values, {
          [key]: cloneDeep(nextValues[key]),
        })
      }
    }),

    block: markRaw((path) => {
      blockers.value[control.getInputName(path)] = true
    }),

    unblock: markRaw((path) => {
      blockers.value[control.getInputName(path)] = false
    }),

    focus: markRaw((path) => {
      focus.value = control.getInputName(path)
    }),

    blur: markRaw(() => {
      focus.value = null
    }),

    enable: markRaw(() => {
      manualDisabled.value = false
    }),

    disable: markRaw(() => {
      manualDisabled.value = true
    }),

    partial: markRaw(
      (getName, getRoutable, getInitialPartialValues, options) => {
        return createForm(
          getName,
          getRoutable,
          () => {
            return getInitialPartialValues(values as any)
          },
          options,
        )
      },
    ),

    getInputName: markRaw((path) => {
      if (!path) {
        return ''
      }

      return castArray(
        path instanceof Event
          ? (path.target as HTMLInputElement | undefined)?.name
          : path,
      ).join('.')
    }),

    getInputId: markRaw((path) => {
      if (!path) {
        return ''
      }

      return castArray(
        path instanceof Event
          ? (path.target as HTMLInputElement | undefined)?.name
          : path,
      ).join('.')
    }),

    on: markRaw(
      <TEventName extends FormEventNames>(
        name: TEventName,
        listener?: FormEventListener<TEventName>,
      ): (() => void) => {
        if (!listener) {
          return () => undefined
        }

        return this.emitter.on(name, listener)
      },
    ),

    off: markRaw(
      <TEventName extends FormEventNames>(
        name: TEventName,
        listener: FormEventListener<TEventName>,
      ): void => {
        return this.emitter.off(name, listener)
      },
    ),
  })

  return control
}
