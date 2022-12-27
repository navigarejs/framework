import Route from './Route'
import { GeneratedRoutes } from './routes'
import { Default, Wildcard } from './symbols'
import { AxiosResponse, AxiosStatic, Canceler, CancelToken } from 'axios'

// Router
export type FragmentOption<TReturn> =
  | TReturn
  | ((options: {
      currentFragments: Fragments
      nextFragments: Fragments
    }) => TReturn | undefined)

export type RouterOptions<TComponent> = {
  initialPage: Page
  base: string
  resolveComponentModule?: ComponentModuleResolver<TComponent>
  fragments?: Record<
    string,
    {
      stacked?: FragmentOption<boolean>
      lazy?: FragmentOption<boolean>
      inert?: FragmentOption<boolean>
    }
  >
  events?: Partial<{
    [TEventName in RouterEventNames]: RouterEventListener<TEventName>
  }>
  transformClientPropertyKey?: (key: PropertyKey) => PropertyKey
  transformServerPropertyKey?: (key: PropertyKey) => PropertyKey
  axios?: AxiosStatic
  generateErrorLink?: (
    file: string,
    row: number,
    column: number,
    url: string,
  ) => string | null
}

export type ComponentModuleResolver<TComponent> = (
  url: string,
  component: Component,
) => Promise<TComponent>

export type RouterLocation = {
  href: string
  host: string
  hostname: string
  origin: string
  pathname: string
  port: string
  protocol: string
  search: string
  hash: string
  state?: string | undefined
}

// Pages
export type DeferredValue = {
  __deferred: true
  __requested?: true
}

export type DeferredProperty<TValue = any> = DeferredValue | TValue

export type PageDefaults = Record<string, any>

export type PageErrors = Record<string, string[]>

export type PageErrorBag = Record<string, PageErrors>

export type PageRememberedState = Record<string, unknown> | undefined

export type Component = {
  id: string
  path: string
}

export type Fragment = {
  name: string
  component: Component
  properties: Properties
  /*rawRoute: RawRoute
  location: RouterLocation
  defaults: PageDefaults
  parameters: Record<string, RouteParameter>*/
  page?: Omit<Page, 'fragments'>
  fallback: boolean
}

export type Fragments = Record<string, (Fragment | null)[] | null>

export interface Page {
  visit: Visit
  csrf: string | null
  fragments: Fragments
  properties: PageProperties & DefaultPageProperties
  rawRoute: RawRoute
  location: RouterLocation
  defaults: PageDefaults
  parameters: Record<string, RouteParameter>
  version: string | null
  layout: string | null
  timestamp: number
  base?: Page

  obsolete: boolean
  scrollRegions: Array<{ top: number; left: number }>
  rememberedState: PageRememberedState
}

export interface PageProperties extends Properties {}

export type DefaultPageProperties = {
  __errors?: PageErrors & PageErrorBag
  __flash?: Record<string, any>
}

export type PropertyKey = string | number

export type PropertyValue =
  | string
  | number
  | boolean
  | any[]
  | null
  | Properties
  | Blob
  | Date

export interface Properties {
  [key: PropertyKey]: PropertyValue
}

// Events
export type RouterEvents = {
  before: {
    details: {
      visit: Visit
    }
    result: boolean | void
  }

  start: {
    parameters: [Visit]
    details: {
      visit: Visit
    }
    result: void
  }

  progress: {
    details: {
      visit: Visit
      progress: VisitProgress | undefined
    }
    result: void
  }

  finish: {
    details: {
      visit: Visit
    }
    result: void
  }

  cancel: {
    details: {
      visit: Visit
    }
    result: void
  }

  navigate: {
    details: {
      visit: Visit
      page: Page
      pages: Page[]
      pageIndex: number
      replace: boolean
    }
    result: void
  }

  success: {
    details: {
      visit: Visit
      page: Page
      response: AxiosResponse
    }
    result: void
  }

  error: {
    details: {
      visit: Visit
      errors: PageErrors
      response: AxiosResponse
    }
    result: void
  }

  invalid: {
    details: {
      visit: Visit
      response: AxiosResponse
    }
    result: boolean | void
  }

  exception: {
    details: {
      visit: Visit
      error: Error
    }
    result: boolean | void
  }
}

export type RouterEventNames = keyof RouterEvents

export type RouterEventDetails<TEventName extends RouterEventNames> =
  RouterEvents[TEventName]['details']

export type RouterEventResult<TEventName extends RouterEventNames> =
  RouterEvents[TEventName]['result']

export type RouterEvent<TEventName extends RouterEventNames> = CustomEvent<
  RouterEventDetails<TEventName>
>

export type RouterEventListener<TEventName extends RouterEventNames> = (
  event: RouterEvent<TEventName>,
) => RouterEventResult<TEventName>

// Visits
export type FormDataConvertible =
  | Array<FormDataConvertible>
  | Blob
  | FormDataEntryValue
  | Date
  | boolean
  | number
  | null
  | Record<string, any>

export type VisitData = Record<string, FormDataConvertible> | FormData

export type VisitCancelToken = {
  token?: CancelToken
  cancel: Canceler
}

export type VisitPreserveOption = boolean | 'errors' | ((page: Page) => boolean)

export type VisitProgress = {
  percentage?: number
  loaded: number
  total?: number
  progress?: number
  bytes: number
  rate?: number
  estimated?: number
  upload?: boolean
  download?: boolean
}

export type LocationVisit = {
  preserveScroll: boolean
}

export type VisitProperties = Array<string>

export type VisitHeaders = Record<string, string>

export type VisitOptions = Partial<{
  fragmentName: string
  method: RawRouteMethod
  data: VisitData
  background: boolean
  replace: boolean
  preserveScroll: VisitPreserveOption
  preserveState: VisitPreserveOption
  preserveURL: VisitPreserveOption
  properties: VisitProperties
  headers: VisitHeaders
  errorBag: string | null
  forceFormData: boolean
  queryStringArrayFormat: QueryStringArrayFormat
  events: Partial<{
    [TEventName in RouterEventNames]: RouterEventListener<TEventName>
  }>
}>

export type Visit = {
  id: VisitId
  method: RouteMethod
  data: VisitData
  replace: boolean
  background: boolean
  preserveScroll: VisitPreserveOption
  preserveState: VisitPreserveOption
  preserveURL: VisitPreserveOption
  properties: Array<string>
  headers: Record<string, string>
  errorBag: string | null
  forceFormData: boolean
  queryStringArrayFormat: QueryStringArrayFormat
  location: RouterLocation
  completed: boolean
  cancelled: boolean
  interrupted: boolean
  cancelToken?: VisitCancelToken
  cancel?: () => void
  interrupt?: () => void
  events: Partial<{
    [TEventName in RouterEventNames]: RouterEventListener<TEventName>
  }>
}

export type VisitId = string

// Routes
export interface Routes extends GeneratedRoutes {}

export enum RouteMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}

export type RouteName = keyof Routes

export type Routable<TRouteName extends RouteName = RouteName> =
  | URL
  | string
  | Route<TRouteName>

export interface BindableRouteParameter {
  id: number | string
}

export type RouteParameter =
  // | BindableRouteParameter
  string | number | boolean | Record<string, any> | undefined | null

/*export type RouteParameters<TParamValue = RouteParameter> = {
  [key: string]: TParamValue
}*/

export type RouteParameters<TRouteName extends RouteName> =
  Routes[TRouteName] extends {
    bindings: any
  }
    ? keyof Routes[TRouteName]['bindings'] extends never
      ? Record<never, never>
      : Record<keyof Routes[TRouteName]['bindings'], RouteParameter>
    : Record<never, never>

export type RouteBindings = Record<string, string | null>

export type RouteWheres = Record<string, string | null>

export type RouteDefaults = Record<string, RouteParameter>

export type RawRouteParameters<TRouteName extends RouteName = RouteName> =
  Routes[TRouteName] extends {
    bindings: any
  }
    ? keyof Routes[TRouteName]['bindings'] extends never
      ? Record<never, never>
      : Record<
          keyof Routes[TRouteName]['bindings'],
          RouteParameter | typeof Default | typeof Wildcard
        >
    : Record<never, never>

export type RawRouteMethod =
  | 'GET'
  | 'HEAD'
  | 'POST'
  | 'PATCH'
  | 'PUT'
  | 'DELETE'

export type RawRoute<TName extends RouteName = RouteName> = {
  name: TName
  uri: string
  methods: RawRouteMethod[]
  method?: RawRouteMethod
  domain?: string
  bindings?: RouteBindings
  parameters?: RouteParameters<TName>
  wheres?: RouteWheres
  components?: Component[]
}

export type RawRoutes = Record<string, RawRoute>

export enum QueryStringArrayFormat {
  Indices = 'indices',
  Brackets = 'brackets',
}

export type ResolvedRoutable = {
  method: RouteMethod
  location: RouterLocation
  data: VisitData
  components: Component[]
  options: RouteOptions
}

export type RouteOptions = Partial<{
  absolute: boolean
  properties: VisitProperties
  headers: VisitHeaders
}>

// Rendered
export interface RenderedApp {
  id: string
  modules: Set<string>
  headTags: string
  htmlAttributes: string
  bodyAttributes: string
  bodyTags: string
  appHTML: string
}
