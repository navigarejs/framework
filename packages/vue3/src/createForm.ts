import { FormControl, FormErrors, FormOptions } from './types'
import useRouter from './useRouter'
import { VisitData, Routable, VisitProgress, getKeys } from '@navigare/core'
import cloneDeep from 'lodash.clonedeep'
import isArray from 'lodash.isarray'
import isEqual from 'lodash.isequal'
import isFunction from 'lodash.isfunction'
import { computed, markRaw, reactive, ref } from 'vue'

const globalDisabled = ref(false)

export default function createForm<
  TValues extends VisitData = VisitData,
  // TTransformedValues extends VisitData = TValues,
>(
  getName: string | (() => string),
  getRoutable: Routable | (() => Routable),
  getInitialValues: TValues | (() => TValues),
  options: FormOptions = {},
): FormControl<TValues> {
  const name = computed(() => {
    if (isFunction(getName)) {
      return getName()
    }

    return getName
  })
  const router = useRouter()
  const routable = computed(() => {
    if (isFunction(getRoutable)) {
      return getRoutable()
    }

    return getRoutable
  })
  const initialValues = computed(() => {
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
  const trigger = ref<HTMLElement | null>(null)
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

        // Submit and react to it's event
        const visit = await router.instance.visit(routable.value, {
          data: cloneDeep(values),

          onProgress(event) {
            progress.value = event.detail.progress ?? null

            options.onProgress?.(event)
          },

          onError(event) {
            errors.value = event.detail.errors

            options.onError?.(event)
          },

          onSuccess(event) {
            // Reset errors
            errors.value = {}

            // Reset values if requested
            if (submitOptions.resetAfterSuccess) {
              control.reset()
            }

            options.onSuccess?.(event)
          },

          onFinish(event) {
            processing.value = false
            globalDisabled.value = false

            options.onFinish?.(event)
          },

          onBefore(event) {
            options.onBefore?.(event)
          },

          onCancel(event) {
            options.onCancel?.(event)
          },

          onStart(event) {
            options.onStart?.(event)
          },

          onInvalid(event) {
            options.onInvalid?.(event)
          },

          onException(event) {
            options.onException?.(event)
          },
        })

        return visit
      },
    ),

    reset: markRaw(() => {
      errors.value = {}

      control.set(initialValues.value)
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
      blockers.value[isArray(path) ? path.join('.') : path] = true
    }),

    unblock: markRaw((path) => {
      blockers.value[isArray(path) ? path.join('.') : path] = false
    }),

    focus: markRaw((path) => {
      focus.value = isArray(path) ? path.join('.') : path
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
  })

  /*const rememberKey =
    typeof rememberKeyOrData === 'string' ? rememberKeyOrData : null
  const data: TValues =
    (typeof rememberKeyOrData === 'string' ? maybeData : rememberKeyOrData) ||
    ({} as TValues)
  const restored = (
    rememberKey ? router.instance.restore(rememberKey) : {}
  ) as FormRestore<TValues>

  let defaults = cloneDeep(data)
  let cancelToken: VisitCancelToken | null = null
  let recentlySuccessfulTimeoutId: ReturnType<typeof setTimeout> | null = null
  let transform: FormTransformer<TValues, TTransformedValues> = (data) =>
    data as unknown as TTransformedValues

  const form = reactive<Form<TValues, TTransformedValues>>({
    ...(restored ? restored.data : data),

    isDirty: false,

    errors: restored.errors ?? {},

    hasErrors: false,

    processing: false,

    progress: null,

    wasSuccessful: false,

    recentlySuccessful: false,

    data() {
      return cloneDeep(data)
    },

    transform(callback) {
      transform = callback

      return this
    },

    defaults(key, value): Form<TValues, TTransformedValues> {
      if (isDefined(key)) {
        defaults = Object.assign(
          {},
          cloneDeep(defaults),
          isDefined(value) ? { [key]: value } : key,
        )
      } else {
        defaults = form.data()
      }

      return form
    },

    reset(...keys): Form<TValues, TTransformedValues> {
      const clonedDefaults = cloneDeep(defaults)

      if (keys.length === 0) {
        Object.assign(form, clonedDefaults)
      } else {
        Object.assign(
          form,
          getKeys(clonedDefaults)
            .filter((key) => keys.includes(key))
            .reduce((carry, key) => {
              carry[key] = clonedDefaults[key]
              return carry
            }, {} as TValues),
        )
      }

      return form
    },

    setError(key, value): Form<TValues, TTransformedValues> {
      Object.assign(form.errors, { [key]: value })

      form.hasErrors = Object.keys(form.errors).length > 0

      return form
    },

    setErrors(errors): Form<TValues, TTransformedValues> {
      Object.assign(form.errors, errors)

      form.hasErrors = Object.keys(form.errors).length > 0

      return form
    },

    clearErrors(...keys): Form<TValues, TTransformedValues> {
      form.errors = Object.keys(form.errors).reduce(
        (carry, field) => ({
          ...carry,
          ...(keys.length > 0 && !keys.includes(field as FormKey<TValues>)
            ? { [field]: this.errors[field] }
            : {}),
        }),
        {},
      )

      form.hasErrors = Object.keys(form.errors).length > 0

      return form
    },

    async submit(methodOrRoute, routableOrOptions, maybeOptions = {}) {
      const method = isString(methodOrRoute)
        ? methodOrRoute
        : methodOrRoute.method
      const routable = isString(methodOrRoute)
        ? (routableOrOptions as Routable)
        : methodOrRoute
      const options = isString(methodOrRoute)
        ? (maybeOptions as VisitOptions)
        : (routableOrOptions as VisitOptions)
      const transformedData = transform(form.data())
      const baseOptions: Partial<VisitOptions> = {
        ...options,

        onCancelToken: (token) => {
          cancelToken = token

          if (options.onCancelToken) {
            return options.onCancelToken(token)
          }
        },

        onBefore: (visit) => {
          form.wasSuccessful = false
          form.recentlySuccessful = false

          if (recentlySuccessfulTimeoutId) {
            clearTimeout(recentlySuccessfulTimeoutId)
          }

          if (options.onBefore) {
            return options.onBefore(visit)
          }
        },

        onStart: (visit) => {
          form.processing = true

          if (options.onStart) {
            return options.onStart(visit)
          }
        },

        onProgress: (event) => {
          form.progress = event.detail.progress ?? null

          if (options.onProgress) {
            return options.onProgress(event)
          }
        },

        onSuccess: async (page) => {
          form.processing = false
          form.progress = null
          form.clearErrors()
          form.wasSuccessful = true
          form.recentlySuccessful = true

          // Keep timer for recently successful state
          recentlySuccessfulTimeoutId = setTimeout(() => {
            form.recentlySuccessful = false
          }, 2000)

          const onSuccess = options.onSuccess
            ? await options.onSuccess(page)
            : null

          defaults = cloneDeep(this.data())

          form.isDirty = false

          return onSuccess
        },

        onError: (event) => {
          const { errors } = event.detail

          form.processing = false
          form.progress = null
          form.clearErrors().setErrors(errors)

          if (options.onError) {
            return options.onError(event)
          }
        },

        onCancel: (event) => {
          form.processing = false
          form.progress = null

          if (options.onCancel) {
            return options.onCancel(event)
          }
        },

        onFinish: (activeVisit) => {
          form.processing = false
          form.progress = null
          cancelToken = null

          if (options.onFinish) {
            return options.onFinish(activeVisit)
          }
        },
      }

      // Delete method has a different signature so we have a special case here
      if (method === RouteMethod.DELETE) {
        return await router.instance.delete(routable, {
          ...baseOptions,
          data: transformedData,
        })
      }

      return await router.instance[method](
        routable,
        transformedData,
        baseOptions,
      )
    },

    async get(routable, options): Promise<ActiveVisit> {
      return await form.submit(RouteMethod.GET, routable, options)
    },

    async post(routable, options): Promise<ActiveVisit> {
      return await form.submit(RouteMethod.POST, routable, options)
    },

    async put(routable, options): Promise<ActiveVisit> {
      return await form.submit(RouteMethod.PUT, routable, options)
    },

    async patch(routable, options): Promise<ActiveVisit> {
      return await form.submit(RouteMethod.PATCH, routable, options)
    },

    async delete(routable, options): Promise<ActiveVisit> {
      return await form.submit(RouteMethod.DELETE, routable, options)
    },

    cancel() {
      cancelToken?.cancel()
    },

    __rememberable: rememberKey === null,

    __remember(): FormRestore<TValues> {
      return { data: form.data(), errors: this.errors }
    },

    __restore(restored) {
      Object.assign(this, restored.data)

      this.setError(restored.errors)
    },
  })

  // Remember values
  watch(
    form,
    (newValue) => {
      form.isDirty = !isEqual(form.data(), defaults)

      if (rememberKey) {
        router.instance.remember(cloneDeep(newValue.__remember()), rememberKey)
      }
    },
    { immediate: true, deep: true },
  )*/

  return control
}
