import Route from './Route'
import { GeneratedRoutes } from './routes'
import { Default, Wildcard } from './symbols'
import { AxiosResponse, Canceler, CancelToken } from 'axios'
import { IsEmptyObject } from 'type-fest'

// Router
export type RouterOptions<TComponent> = {
  initialPage: Page
  base: string
  resolveComponentModule?: ComponentModuleResolver<TComponent>
  fragments?: Record<
    string,
    {
      stacked?: boolean
      lazy?: boolean
    }
  >
  events?: {
    onBefore?: RouterEventListener<'before'>
    onStart?: RouterEventListener<'start'>
    onProgress?: RouterEventListener<'progress'>
    onFinish?: RouterEventListener<'finish'>
    onCancel?: RouterEventListener<'cancel'>
    onSuccess?: RouterEventListener<'success'>
    onError?: RouterEventListener<'error'>
    onInvalid?: RouterEventListener<'invalid'>
    onException?: RouterEventListener<'exception'>
  }
}

export type ComponentModuleResolver<TComponent> = (
  url: string,
  component: PageComponent,
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
}

export type DeferredProperty<TValue = any> = DeferredValue | TValue

export type PageDefaults = Record<string, any>

export type PageErrors = Record<string, string[]>

export type PageErrorBag = Record<string, PageErrors>

export interface PageProperties {
  [key: string]: unknown
}

export type PageRememberedState = Record<string, unknown> | undefined

export type PageFragmentProperties = Record<string, any>

export type PageComponent = {
  id: string
  path: string
}

export type PageFragment = {
  component: PageComponent
  properties: PageFragmentProperties
  /*rawRoute: RawRoute
  location: RouterLocation
  defaults: PageDefaults
  parameters: Record<string, RouteParameter>*/
  page?: Page
}

export type PageFragments = Record<string, PageFragment | PageFragment[] | null>

export interface Page {
  visit: Visit
  csrf: string | null
  fragments: PageFragments
  properties: PageProperties & {
    errors?: PageErrors & PageErrorBag
  }
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
    }
    result: void
  }

  error: {
    details: {
      visit: Visit
      errors: PageErrors
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

export type RouterEventListener<TEventName extends RouterEventNames> = (
  event: CustomEvent<RouterEventDetails<TEventName>>,
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

export type VisitPreserveStateOption =
  | boolean
  | string
  | ((page: Page) => boolean)

export type VisitProgress = {
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

export type VisitOptions = Partial<{
  method: RawRouteMethod
  data: VisitData
  replace: boolean
  preserveScroll: VisitPreserveStateOption
  preserveState: VisitPreserveStateOption
  properties: Array<string>
  headers: Record<string, string>
  errorBag: string | null
  forceFormData: boolean
  queryStringArrayFormat: QueryStringArrayFormat
  onBefore: RouterEventListener<'before'>
  onStart: RouterEventListener<'start'>
  onProgress: RouterEventListener<'progress'>
  onFinish: RouterEventListener<'finish'>
  onCancel: RouterEventListener<'cancel'>
  onSuccess: RouterEventListener<'success'>
  onError: RouterEventListener<'error'>
  onInvalid: RouterEventListener<'invalid'>
  onException: RouterEventListener<'exception'>
}>

export type Visit = {
  id: VisitId
  method: RouteMethod
  data: VisitData
  replace: boolean
  preserveScroll: VisitPreserveStateOption
  preserveState: VisitPreserveStateOption
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
  onBefore?: RouterEventListener<'before'>
  onStart?: RouterEventListener<'start'>
  onProgress?: RouterEventListener<'progress'>
  onFinish?: RouterEventListener<'finish'>
  onCancel?: RouterEventListener<'cancel'>
  onSuccess?: RouterEventListener<'success'>
  onError?: RouterEventListener<'error'>
  onInvalid?: RouterEventListener<'invalid'>
  onException?: RouterEventListener<'exception'>
}

export type VisitId = string

export type Component = unknown

// Routes
export type Routes = GeneratedRoutes & {}

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
    ? IsEmptyObject<Routes[TRouteName]['bindings']> extends true
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
    ? IsEmptyObject<Routes[TRouteName]['bindings']> extends true
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
  components?: PageComponent[]
}

export type RawRoutes = Record<string, RawRoute>

export enum QueryStringArrayFormat {
  Indices = 'indices',
  Brackets = 'brackets',
}

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
