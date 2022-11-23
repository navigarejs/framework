import {
  DeferredValue,
  Page,
  Fragment,
  Fragments,
  RawRouteMethod,
  RouterOptions,
  VisitData,
  Properties,
  PropertyKey,
} from './types'
import {
  FormDataConvertible,
  RouteMethod,
  QueryStringArrayFormat,
} from './types'
import castArray from 'lodash.castarray'
import cloneDeep from 'lodash.clonedeep'
import isArray from 'lodash.isarray'
import isFunction from 'lodash.isfunction'
import isObject from 'lodash.isobject'
import isString from 'lodash.isstring'
import merge from 'lodash.merge'
import uniq from 'lodash.uniq'
import { stringify, parse } from 'qs'

export function isSSR(): boolean {
  return typeof window === 'undefined'
}

export function isDefined<TValue>(value: TValue | undefined): value is TValue {
  return typeof value !== 'undefined'
}

export function throwError(message: string, ..._args: any[]): never {
  throw new Error(`Navigare: ${message}.`)
}

export function shouldInterceptLink(
  event: KeyboardEvent | MouseEvent,
): boolean {
  const { target } = event

  if (!target) {
    return false
  }

  const element = target as HTMLElement

  if (element.isContentEditable) {
    return false
  }

  if (event.defaultPrevented) {
    return false
  }

  // Left mouse click
  if (
    ('which' in event && event.which !== 1) ||
    ('button' in event ? event.button !== 0 : false)
  ) {
    return false
  }

  if (event.altKey) {
    return false
  }

  if (event.ctrlKey) {
    return false
  }

  if (event.metaKey) {
    return false
  }

  if (event.shiftKey) {
    return false
  }

  return true
}

export function mergeDataIntoQueryString(
  method: RouteMethod,
  href: string,
  data: Record<string, FormDataConvertible>,
  queryStringArrayFormat: QueryStringArrayFormat = QueryStringArrayFormat.Brackets,
): {
  href: string
  data: Record<string, FormDataConvertible>
  method: RouteMethod
} {
  const hasHost = /^https?:\/\//.test(href)
  const hasAbsolutePath = hasHost || href.startsWith('/')
  const hasRelativePath =
    !hasAbsolutePath && !href.startsWith('#') && !href.startsWith('?')
  const hasSearch =
    href.includes('?') ||
    (method === RouteMethod.GET && Object.keys(data).length)
  const hasHash = href.includes('#')

  const url = new URL(href, 'http://localhost')

  if (method === RouteMethod.GET && Object.keys(data).length) {
    url.search = stringify(
      merge(parse(url.search, { ignoreQueryPrefix: true }), data),
      {
        encodeValuesOnly: true,
        arrayFormat: queryStringArrayFormat,
      },
    )
    data = {}
  }

  return {
    href: [
      hasHost ? `${url.protocol}//${url.host}` : '',
      hasAbsolutePath ? url.pathname : '',
      hasRelativePath ? url.pathname.substring(1) : '',
      hasSearch ? url.search : '',
      hasHash ? url.hash : '',
    ].join(''),
    data,
    method,
  }
}

export function mergeFragments<TComponentModule>(
  currentFragments: Fragments,
  nextFragments: Fragments,
  options: RouterOptions<TComponentModule>['fragments'] = {},
): Fragments {
  return uniq([...getKeys(currentFragments), ...getKeys(nextFragments)]).reduce(
    (cumulatedFragments, name) => {
      let mergedFragment: Fragment[] | null = cumulatedFragments[name] ?? null
      const nextFragment = nextFragments[name] as Fragment[] | null | undefined

      if (nextFragment) {
        if (mergedFragment) {
          const lastFragment = mergedFragment[mergedFragment.length - 1]

          // In case the last modal points to the same URL, we will replace it
          for (const fragment of castArray(nextFragment)) {
            if (
              !options[name]?.stacked ||
              (lastFragment?.page &&
                fragment.page &&
                lastFragment?.page?.location.href ===
                  fragment.page?.location.href)
            ) {
              mergedFragment.splice(mergedFragment.length - 1, 1, {
                ...fragment,
                properties: {
                  ...lastFragment.properties,
                  ...fragment.properties,
                },
              })
            } else {
              mergedFragment.push(fragment)
            }
          }
        } else {
          mergedFragment = [...nextFragment]
        }
      } else if (nextFragment === null) {
        mergedFragment = null
      } else if (
        (isDefined(options[name]?.lazy)
          ? !options[name]?.lazy
          : name !== 'default') &&
        !nextFragment
      ) {
        mergedFragment = null
      }

      return {
        ...cumulatedFragments,
        [name]: mergedFragment,
      }
    },
    currentFragments,
  )
}

export function assignPageToFragments(page: Page) {
  for (const fragments of Object.values(page.fragments)) {
    for (const fragment of castArray(fragments).filter(isNotNull)) {
      if (fragment.page) {
        continue
      }

      fragment.page = cloneDeep(page)
    }
  }
}

export function mergePages<TComponentModule>(
  page: Page | undefined,
  nextPage: Page,
  options: RouterOptions<TComponentModule>['fragments'] = {},
): Page {
  // Assign pages to fragments
  if (page) {
    assignPageToFragments(page)
  }
  assignPageToFragments(nextPage)

  // Merge fragments
  nextPage.fragments = mergeFragments(
    page?.fragments || {},
    nextPage.fragments,
    options,
  )

  return nextPage
}

export function isNull<TValue>(value: TValue | null): value is null {
  return value === null
}

export function isNotNull<TValue>(value: TValue | null): value is TValue {
  return value !== null
}

export function getKeys<TValue extends {}>(value: TValue): (keyof TValue)[] {
  return Object.keys(value) as unknown as (keyof TValue)[]
}

export function objectToFormData(
  source: Record<string, FormDataConvertible> = {},
  form: FormData = new FormData(),
  parentKey: string | null = null,
): FormData {
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      appendToFormData(form, composeKey(parentKey, key), source[key])
    }
  }

  return form
}

const composeKey = (parent: string | null, key: string): string => {
  return parent ? `${parent}[${key}]` : key
}

const appendToFormData = (
  form: FormData,
  key: string,
  value: FormDataConvertible,
): void => {
  if (Array.isArray(value)) {
    return Array.from(value.keys()).forEach((index) =>
      appendToFormData(form, composeKey(key, index.toString()), value[index]),
    )
  }

  if (value instanceof Date) {
    return form.append(key, value.toISOString())
  }

  if (value instanceof File) {
    return form.append(key, value, value.name)
  }

  if (value instanceof Blob) {
    return form.append(key, value)
  }

  if (typeof value === 'boolean') {
    return form.append(key, value ? '1' : '0')
  }

  if (typeof value === 'string') {
    return form.append(key, value)
  }

  if (typeof value === 'number') {
    return form.append(key, `${value}`)
  }

  if (value === null || value === undefined) {
    return form.append(key, '')
  }

  objectToFormData(value, form, key)
}

export function hasFiles(data: VisitData | FormDataConvertible): boolean {
  if (isSSR()) {
    return false
  }

  if (data instanceof File) {
    return true
  }

  if (data instanceof Blob) {
    return true
  }

  if (data instanceof FileList && data.length > 0) {
    return true
  }

  if (
    data instanceof FormData &&
    Array.from(data.values()).some((value) => hasFiles(value))
  ) {
    return true
  }

  if (
    typeof data === 'object' &&
    data !== null &&
    Object.values(data).some((value) => hasFiles(value))
  ) {
    return true
  }

  return false
}

export function createEmitter<
  TEvents extends Record<
    string,
    {
      details: Record<any, any>
      result: any
    }
  >,
>(
  events: Partial<{
    [TEventName in keyof TEvents]: Partial<{
      options: Partial<EventInit>
      handle: (result: TEvents[TEventName]['result']) => boolean
    }>
  }>,
): {
  off: <TEventName extends keyof TEvents>(
    name: TEventName,
    listener: (
      event: CustomEvent<TEvents[TEventName]['details']>,
    ) => TEvents[TEventName]['result'],
  ) => void
  on: <TEventName extends keyof TEvents>(
    name: TEventName,
    listener: (
      event: CustomEvent<TEvents[TEventName]['details']>,
    ) => TEvents[TEventName]['result'],
  ) => () => void
  emit: <TEventName extends keyof TEvents>(
    name: TEventName,
    details: TEvents[TEventName]['details'],
    initialListener?: (
      event: CustomEvent<TEvents[TEventName]['details']>,
    ) => TEvents[TEventName]['result'],
  ) => Promise<boolean>
} {
  const all: Partial<Record<keyof TEvents, ((event: any) => void)[]>> = {}
  const off = <TEventName extends keyof TEvents>(
    name: TEventName,
    listener?: (
      event: CustomEvent<TEvents[TEventName]['details']>,
    ) => TEvents[TEventName]['result'],
  ): void => {
    const listeners = all[name]

    if (listeners) {
      if (listener) {
        listeners.splice(listeners.indexOf(listener) >>> 0, 1)
      } else {
        all[name] = []
      }
    }
  }
  const on = <TEventName extends keyof TEvents>(
    name: TEventName,
    listener: (
      event: CustomEvent<TEvents[TEventName]['details']>,
    ) => TEvents[TEventName]['result'],
  ): (() => void) => {
    const listeners = all[name]

    if (listeners) {
      listeners.push(listener)
    } else {
      all[name] = [listener]
    }

    return () => {
      return off(name, listener)
    }
  }
  const emit = async <TEventName extends keyof TEvents>(
    name: TEventName,
    details: TEvents[TEventName]['details'],
    initialListener?: (
      event: CustomEvent<TEvents[TEventName]['details']>,
    ) => TEvents[TEventName]['result'],
  ): Promise<boolean> => {
    const event = new CustomEvent(String(name), {
      ...events[name]?.options,
      detail: details,
    })

    // Dispatches a synthetic event event to target and returns true if either event's cancelable attribute value is false or its preventDefault() method was not invoked, and false otherwise.
    const listeners = [initialListener, ...(all[name] ?? [])]

    for (const listener of listeners) {
      const result = await listener?.(event as any)

      const handle = events[name]?.handle
      if (handle) {
        if (!handle(result)) {
          return false
        }
      }

      if (!event.cancelable) {
        continue
      }

      if (event.defaultPrevented) {
        return false
      }
    }

    return true
  }

  return {
    on,
    off,
    emit,
  }
}

export function mapRouteMethod(
  method: RawRouteMethod | undefined,
): RouteMethod {
  switch (method) {
    case 'GET':
      return RouteMethod.GET
    case 'POST':
      return RouteMethod.POST
    case 'PUT':
      return RouteMethod.PUT
    case 'PATCH':
      return RouteMethod.PATCH
    case 'DELETE':
      return RouteMethod.DELETE
  }

  return RouteMethod.GET
}

export function safeParse<TOutput = unknown, TErrorOutput = undefined>(
  input: string | undefined | null,
  errorCallback?: (error: unknown) => TErrorOutput,
): TOutput | TErrorOutput {
  return safe<TOutput, TErrorOutput>(() => {
    if (!input) {
      throw Error('invalid input')
    }

    return JSON.parse(input)
  }, errorCallback)
}

export function safe<TOutput, TErrorOutput = undefined>(
  callback: () => TOutput,
  errorCallback?: (error: unknown) => TErrorOutput,
): TOutput | TErrorOutput {
  try {
    return callback()
  } catch (error) {
    return errorCallback?.(error) as TErrorOutput
  }
}

export function serialize<TInput>(input: TInput): string {
  return JSON.stringify(input, (_key, value) => {
    if (isFunction(value)) {
      return undefined
    }

    return value
  })
}

export function isDeferred<TInput>(
  input: TInput | DeferredValue,
): input is DeferredValue {
  if (!isObject(input)) {
    return false
  }

  return input.__deferred === true
}

export function getPageProperties(page: Page): Properties {
  const allFragmentProperties = Object.values(page.fragments)
    .flat()
    .filter(isNotNull)
    .filter((fragment) => {
      return fragment.page?.location.href === page.location.href
    })
    .reduce((cumulatedProperties, fragment) => {
      const getPropertySelectors = (properties: Record<string, any>) => {
        return Object.fromEntries(
          Object.entries(properties).map(([propertyName, value]) => {
            return [`${fragment.name}/${propertyName}`, value]
          }),
        )
      }

      if (!fragment) {
        return cumulatedProperties
      }

      return {
        ...cumulatedProperties,
        ...getPropertySelectors(fragment.properties),
      }
    }, {})

  return {
    ...page.properties,
    ...allFragmentProperties,
  }
}

export function getDeferredPageProperties(page: Page): Partial<Properties> {
  return Object.fromEntries(
    Object.entries(getPageProperties(page)).filter(([, property]) => {
      return isDeferred(property)
    }),
  )
}

export function transformProperty(
  property: PropertyKey,
  transform: (value: PropertyKey) => PropertyKey = (value) => value,
): PropertyKey {
  if (isString(property) && property.includes('.')) {
    return property
      .split('.')
      .map((part) => transform(part))
      .join('.')
  }

  return transform(property)
}

export function transformProperties(
  properties: Properties,
  transform: (value: PropertyKey) => PropertyKey = (value) => value,
): Properties {
  return Object.fromEntries(
    Object.entries(properties).map(([key, value]) => {
      return [
        transform(key),
        isObject(value) &&
        !isArray(value) &&
        !(value instanceof Blob) &&
        !(value instanceof Date)
          ? transformProperties(value, transform)
          : value,
      ]
    }),
  )
}

export function transformPageProperties(
  page: Page,
  transform: (key: PropertyKey) => PropertyKey = (key) => key,
): Page {
  page.properties = transformProperties(page.properties, transform)
  page.fragments = Object.fromEntries(
    Object.entries(page.fragments).map(([name, fragments]) => {
      if (fragments) {
        for (const fragment of fragments) {
          fragment.properties = transformProperties(
            fragment.properties,
            transform,
          )
        }
      }

      return [name, fragments]
    }),
  )

  return page
}
