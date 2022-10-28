import type Root from './Root'
import type plugin from './plugin'
import {
  ActiveVisit,
  ComponentResolver,
  EventListener,
  EventNames,
  Page,
  PageFragment,
  PageFragments,
  PartialRoute,
  RawRoutes,
  Routable,
  Route,
  RouteName,
  RouteParameter,
  Router,
  RouterLocation,
  RouterOptions,
  VisitData,
  VisitOptions,
  VisitProgress,
} from '@navigare/core'
import { HeadClient } from '@vueuse/head'
import { InjectionKey, App as VueApp, DefineComponent } from 'vue'

export type App = {
  root: VueApp
  page: Page
  id: string
  head: HeadClient
}

export type Options = {
  id?: string
  resolveComponent: ComponentResolver<DefineComponent>
  setup: Setup
  initialPage?: Page
  rawRoutes?: RawRoutes
  Layout?: DefineComponent
  fragments?: RouterOptions<DefineComponent>['fragments']
}

export type Setup = (options: {
  Root: typeof Root
  props: PropsOf<typeof Root>
  router: Router<DefineComponent>
  plugin: typeof plugin
  initialPage: Page
}) => VueApp

// Router
export type RouterControl = {
  components: Record<string, DefineComponent>
  location: RouterLocation
  parameters: Record<string, RouteParameter>
  route: Route<RouteName>
  page: Page
  previousPage: Page
  latestPage: Page
  pages: Page[]
  fragment: {
    fragment: PageFragment | null
    rawRoute: Page['rawRoute']
    parameters: Page['parameters']
    defaults: Page['defaults']
  }
  fragments: PageFragments
  processing: boolean
  get(
    routable: Routable,
    data?: VisitData,
    options?: Exclude<VisitOptions, 'method' | 'data'>,
  ): Promise<ActiveVisit>
  post(
    routable: Routable,
    data?: VisitData,
    options?: Exclude<VisitOptions, 'method' | 'data'>,
  ): Promise<ActiveVisit>
  put(
    routable: Routable,
    data?: VisitData,
    options?: Exclude<VisitOptions, 'method' | 'data'>,
  ): Promise<ActiveVisit>
  patch(
    routable: Routable,
    data?: VisitData,
    options?: Exclude<VisitOptions, 'method' | 'data'>,
  ): Promise<ActiveVisit>
  delete(
    routable: Routable,
    options?: Exclude<VisitOptions, 'method'>,
  ): Promise<ActiveVisit>
  reload(
    options?: Exclude<VisitOptions, 'preserveScroll' | 'preserveState'>,
  ): Promise<ActiveVisit>
  back(fallback?: Routable): Promise<void>
  replace(routable: Routable): Promise<never>
  push(routable: Routable): Promise<never>
  matches(
    comparableRoute: Routable | PartialRoute<RouteName>,
    route?: Route<RouteName>,
  ): boolean
  on<TEventName extends EventNames>(
    name: TEventName,
    listener: EventListener<TEventName>,
  ): () => void
  off<TEventName extends EventNames>(
    name: TEventName,
    listener: EventListener<TEventName>,
  ): void
  instance: Router<DefineComponent>
}

// Forms
export type FormRestore<TData> = {
  data?: TData
  errors?: FormErrors
}

export type FormKey<TData> = keyof TData

export type FormTransformer<TData, TTransformedData extends VisitData> = (
  data: TData,
) => TTransformedData

export interface FormErrors {
  [key: string]: string | FormErrors
}

export interface FormSubmitOptions {
  trigger?: HTMLElement | null
  resetAfterSuccess?: boolean
}

export interface FormOptions extends VisitOptions {
  disabled?: () => boolean
}

export interface FormControl<
  TValues extends VisitData,
  // TTransformedValues extends VisitData = TValues,
> {
  name: string

  values: TValues

  routable: Routable

  errors: FormErrors

  dirty: boolean

  blocked: boolean

  blockers: Record<string, boolean>

  processing: boolean

  disabled: boolean

  progress: VisitProgress | null

  trigger: HTMLElement | null

  submit(options?: FormSubmitOptions): Promise<ActiveVisit | undefined>

  reset(): void

  clear(): void

  set(values?: Partial<TValues>): void

  block(path: string | string[]): void

  unblock(path: string | string[]): void

  focus(path: string | string[]): void

  blur(path: string | string[]): void

  enable(): void

  disable(): void
}

// Helpers
export type ContextOf<TContext> = TContext extends InjectionKey<infer TInner>
  ? TInner
  : never

export type PropsOf<
  TComponent extends {
    new (...args: any[]): {
      $props: Record<string, any>
    }
  },
> = InstanceType<TComponent>['$props']
