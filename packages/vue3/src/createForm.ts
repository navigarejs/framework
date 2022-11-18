import useRouter from './compositions/useRouter'
import {
  FormControl,
  FormError,
  FormErrors,
  FormEvents,
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
  const values = reactive(initialValues.value)
  const keys = computed(() => {
    return getKeys(values).filter((key) => isSymbol(key)) as any as Exclude<
      keyof TValues,
      symbol
    >[]
  })
  const errors = reactive<FormErrors>({})
  const dirty = ref(false)
  const valid = computed(() => {
    const isValid = (errors: FormError): boolean => {
      if (!errors) {
        return true
      }

      if (isArray(errors)) {
        return errors.length === 0
      }

      if (isString(errors)) {
        return errors.length === 0
      }

      return Object.values(errors).every((error) => isValid(error))
    }

    return isValid(errors)
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

  // Watch values to determine dirty flag
  watch(
    () => initialValues.value,
    (nextInitialValues) => {
      dirty.value = !isEqual(cloneDeep(values), nextInitialValues)
    },
    {
      deep: true,
    },
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

    valid,

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
            errors,
          })
        ) {
          return undefined
        }

        // Submit via callback
        if (callback.value) {
          await callback.value(clonedValues)

          emitter.emit('success', {})

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
              },

              error(event) {
                control.clearErrors()
                control.setErrors(event.detail.errors)
              },

              success(event) {
                // Clear errors
                control.clearErrors()

                // Reset values if requested
                if (submitOptions.resetAfterSuccess) {
                  control.reset()
                }

                emitter.emit(
                  'success',
                  event.detail,
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

                control.setErrors(response?.data.errors ?? {})
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

    setError: markRaw((name, error) => {
      set(errors, name, error)
    }),

    clearErrors: markRaw((paths) => {
      for (const path of paths ?? keys.value) {
        control.setError(path, undefined)
      }
    }),
  })

  return control
}
