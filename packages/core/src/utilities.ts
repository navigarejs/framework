import {
  PageFragment,
  PageFragments,
  RawRouteMethod,
  RouterOptions,
  VisitData,
} from './types'
import {
  FormDataConvertible,
  RouteMethod,
  QueryStringArrayFormat,
} from './types'
import castArray from 'lodash.castarray'
import isArray from 'lodash.isarray'
import isFunction from 'lodash.isfunction'
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

export function getInitialFragments<TComponent>(
  options?: RouterOptions<TComponent>['fragments'],
): PageFragments {
  return Object.fromEntries(
    Object.entries(options || {})
      .map(([name, { stacked }]) => {
        return [name, stacked ? [] : null]
      })
      .filter(isNotNull),
  )
}

export function mergeFragments(
  fragments: PageFragments,
  nextFragments: PageFragments,
): PageFragments {
  return uniq([...getKeys(fragments), ...getKeys(nextFragments)]).reduce(
    (cumulatedFragments, name) => {
      let mergedFragment: PageFragment | PageFragment[] | null =
        cumulatedFragments[name] ?? null
      const nextFragment = nextFragments[name] as PageFragment | null

      // Keep accumulating stacked fragments as long as the next one is not empty
      if (isArray(mergedFragment)) {
        if (nextFragment) {
          mergedFragment = [...mergedFragment, ...castArray(nextFragment)]
        } else {
          mergedFragment = []
        }
      } else if (nextFragment) {
        mergedFragment = nextFragment
      } else if (isNull(nextFragment)) {
        mergedFragment = null
      }

      return {
        ...cumulatedFragments,
        [name]: mergedFragment,
      }
    },
    fragments,
  )
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

export function createEmitter<TEvents extends Record<string, any>>(): {
  off: <TEventName extends keyof TEvents>(
    name: TEventName,
    listener: (event: TEvents[TEventName]) => void,
  ) => void
  on: <TEventName extends keyof TEvents>(
    name: TEventName,
    listener: (event: TEvents[TEventName]) => void,
  ) => () => void
  emit: <TEventName extends keyof TEvents>(
    name: TEventName,
    event: TEvents[TEventName],
  ) => boolean
} {
  const all: Partial<Record<keyof TEvents, ((event: any) => void)[]>> = {}
  const off = <TEventName extends keyof TEvents>(
    name: TEventName,
    listener?: (event: TEvents[TEventName]) => void,
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
    listener: (event: TEvents[TEventName]) => void,
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
  const emit = <TEventName extends keyof TEvents>(
    name: TEventName,
    event: TEvents[TEventName],
  ): boolean => {
    //Dispatches a synthetic event event to target and returns true if either event's cancelable attribute value is false or its preventDefault() method was not invoked, and false otherwise.
    const listeners = all[name] ?? []

    for (const listener of listeners) {
      listener(event)

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
