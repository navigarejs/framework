import useRouter from './compositions/useRouter'
import {
  FormControl,
  FormError,
  FormErrors,
  FormEvents,
  FormInputName,
  FormOptions,
  FormTrigger,
  FormValues,
  FormVisitOptions,
} from './types'
import {
  Routable,
  VisitProgress,
  getKeys,
  isDefined,
  createEmitter,
} from '@navigare/core'
import castArray from 'lodash.castarray'
import cloneDeep from 'lodash.clonedeep'
import get from 'lodash.get'
import isArray from 'lodash.isarray'
import isEqual from 'lodash.isequal'
import isFunction from 'lodash.isfunction'
import isString from 'lodash.isstring'
import isSymbol from 'lodash.issymbol'
import mergeWith from 'lodash.mergewith'
import set from 'lodash.set'
import { computed, markRaw, reactive, ref, watch } from 'vue'

const globalDisabled = ref(false)

export default function createForm<
  TValues extends FormValues = FormValues,
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
  const getInitialOrRestoredValues = (): TValues => {
    const restoredValues = router.instance.restore(name.value)
    if (options.remember && restoredValues) {
      return restoredValues as TValues
    }

    if (isFunction(getInitialValues)) {
      return getInitialValues()
    }

    return getInitialValues
  }
  const initialValues = ref<TValues>(cloneDeep(getInitialOrRestoredValues()))
  const values = reactive(getInitialOrRestoredValues())
  const keys = computed(() => {
    return getKeys(values).filter((key) => isSymbol(key)) as any as Exclude<
      keyof TValues,
      symbol
    >[]
  })
  const errors = reactive<FormErrors>({})
  const dirty = ref(false)
  const valid = computed(() => {
    return Object.values(errors).every((error) => {
      if (!error) {
        return true
      }

      if (isArray(error)) {
        return error.length === 0
      }

      return error.length === 0
    })
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
  const focused = ref<FormInputName | null>(null)
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
  const successful = ref<boolean | undefined>(undefined)
  const recentlySuccessful = ref<boolean | undefined>(undefined)

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

  // Watch values to determine dirty flag
  watch(
    [() => values, () => initialValues.value],
    ([nextValues, nextInitialValues]) => {
      dirty.value = !isEqual(nextValues, nextInitialValues)
    },
    {
      deep: true,
    },
  )

  // Temporary set recentlySuccessful
  watch(
    () => successful.value,
    (nextSuccesful) => {
      if (!nextSuccesful) {
        return
      }

      recentlySuccessful.value = true

      setTimeout(() => {
        recentlySuccessful.value = false
      }, 2000)
    },
  )

  // Expose control
  const control: FormControl<TValues> = reactive({
    name,

    options: {
      validate: options.validate ?? false,
    },

    values: values as any,

    initialValues: initialValues as any,

    routable,

    errors,

    dirty,

    blocked,

    blockers,

    processing,

    disabled,

    progress,

    valid,

    trigger,

    focused,

    successful,

    recentlySuccessful,

    submit: markRaw(
      async (
        submitOptions = {
          trigger: null,
        },
      ) => {
        if (disabled.value || blocked.value) {
          return
        }

        // Run "before" hook
        emitter.emit('before', {})

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
            errors,
          })
        ) {
          return undefined
        }

        // Submit via callback
        if (callback.value) {
          const response = await callback.value(clonedValues)

          successful.value = true

          emitter.emit('success', {
            response,
          })

          return undefined
        }

        // ... or submit via route
        if (routable.value) {
          const visitOptions = options as FormVisitOptions<TValues>
          const visit = await router.instance.visit(routable.value, {
            data: await transform(clonedValues),

            events: {
              progress(event) {
                progress.value = event.detail.progress ?? null
              },

              error(event) {
                successful.value = false

                control.clearErrors()
                control.setErrors(event.detail.errors)
              },

              success(event) {
                successful.value = true

                // Clear errors
                control.clearErrors()

                // Reset values
                if (!isDefined(options.reset) || !!options.reset) {
                  control.reset()
                }

                // Emit event
                emitter.emit(
                  'success',
                  {
                    response: event.detail.page,
                  },
                  visitOptions.events?.success,
                )
              },

              finish(_event) {
                processing.value = false
                globalDisabled.value = false
                trigger.value = null
              },

              before(_event) {},

              cancel(_event) {},

              start(_event) {},

              invalid(_event) {
                processing.value = false
                globalDisabled.value = false
                trigger.value = null
              },

              exception(_event) {
                processing.value = false
                globalDisabled.value = false
                trigger.value = null
              },
            },
          })

          return visit
        }

        return undefined
      },
    ),

    validate: markRaw(async (path) => {
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
                .map(([key, value]) => {
                  if (value instanceof Blob) {
                    return undefined
                  }

                  return [key, value]
                })
                .filter(isDefined),
            )

            // Stop unnecessary requests early
            if (!getKeys(sanitizedValues).length) {
              return
            }
            if (!isDefined(get(sanitizedValues, name.split('.')))) {
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
                'Precognition-Validate-Only':
                  router.instance.transformClientPropertyKey(name),
              },
              signal: abortController.signal,
            })

            // Clear previous errors if this validation was successful
            if (name) {
              control.setError(name, null)
            } else {
              control.clearErrors()
            }

            // Clear request
            delete validationRequests[name].abortController
          } catch (error) {
            if (router.instance.axios.isAxiosError(error)) {
              if (error.code === 'ERR_CANCELED') {
                // Ignore
              } else {
                const { response } = error

                control.setErrors(
                  Object.fromEntries(
                    Object.entries(response?.data.errors).map(
                      ([key, value]) => {
                        return [
                          router.instance.transformServerPropertyKey(key),
                          value as FormError,
                        ]
                      },
                    ),
                  ),
                )
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

    reset: markRaw((paths) => {
      control.clearValues(paths)
      control.clearErrors(paths)

      initialValues.value = cloneDeep(getInitialOrRestoredValues())

      emitter.emit('reset', {})
    }),

    clearValues: markRaw((paths) => {
      if (!paths) {
        control.setValues(initialValues.value)
        return
      }

      for (const path of paths) {
        control.setValue(path, get(initialValues.value, path))
      }
    }),

    setValue: markRaw((nextValues, nextValue) => {
      set(values, nextValues, nextValue)
    }),

    setValues: markRaw((nextValues) => {
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
      focused.value = control.getInputName(path)
    }),

    blur: markRaw(() => {
      focused.value = null
    }),

    enable: markRaw(() => {
      manualDisabled.value = false
    }),

    disable: markRaw(() => {
      manualDisabled.value = true
    }),

    partial: markRaw(
      (
        getPartialName,
        getPartialRoutable,
        getInitialPartialValues,
        options,
      ) => {
        return createForm(
          getPartialName,
          getPartialRoutable,
          () => {
            return getInitialPartialValues(values)
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
      )
        .map((name) => {
          if (isString(name) && name.includes('#')) {
            return name.split('#')[0]
          }

          return name
        })
        .join('.')
    }),

    getInputId: markRaw((path) => {
      return control
        .getInputName(path)
        .replace(/[^a-z0-9\-_:\.]|^[^a-z]+/gi, '')
    }),

    on: markRaw((name, listener) => {
      if (!listener) {
        return () => undefined
      }

      return emitter.on(name, listener)
    }),

    off: markRaw((name, listener) => {
      return emitter.off(name, listener)
    }),

    setErrors: markRaw((nextErrors) => {
      mergeWith(errors, nextErrors)
    }),

    setError: markRaw((path, error) => {
      set(errors, castArray(path).join('.'), error)
    }),

    clearErrors: markRaw((paths) => {
      for (const path of paths ?? keys.value) {
        control.setError(castArray(path).join('.'), undefined)
      }
    }),
  })

  return control
}
