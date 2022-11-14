import type Root from './Root'
import type plugin from './plugin'
import { PageFragmentContext } from './providePageFragmentContext'
import {
  ComponentModuleResolver,
  EventListener,
  EventNames,
  Page,
  PageFragments,
  PartialRoute,
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
  Visit,
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
  resolveComponentModule?: ComponentModuleResolver<DefineComponent>
  setup: Setup
  initialPage?: Page
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
  location: RouterLocation
  parameters: Record<string, RouteParameter>
  route: Route<RouteName>
  page: Page
  previousPage: Page | undefined
  latestPage: Page
  pages: Page[]
  layout: string | null
  fragment: ContextOf<typeof PageFragmentContext>
  fragments: PageFragments
  processing: boolean
  get(
    routable: Routable,
    data?: VisitData,
    options?: Exclude<VisitOptions, 'method' | 'data'>,
  ): Promise<Visit>
  post(
    routable: Routable,
    data?: VisitData,
    options?: Exclude<VisitOptions, 'method' | 'data'>,
  ): Promise<Visit>
  put(
    routable: Routable,
    data?: VisitData,
    options?: Exclude<VisitOptions, 'method' | 'data'>,
  ): Promise<Visit>
  patch(
    routable: Routable,
    data?: VisitData,
    options?: Exclude<VisitOptions, 'method' | 'data'>,
  ): Promise<Visit>
  delete(
    routable: Routable,
    options?: Exclude<VisitOptions, 'method'>,
  ): Promise<Visit>
  reload(
    options?: Exclude<VisitOptions, 'preserveScroll' | 'preserveState'>,
  ): Promise<Visit>
  back(fallback?: Routable): Promise<void>
  replace(routable: Routable): Promise<never>
  push(routable: Routable): Promise<never>
  match(
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
  [name: string]: string[]
}

export interface FormSubmitOptions {
  trigger?: HTMLElement | null
  resetAfterSuccess?: boolean
}

export interface FormOptions extends VisitOptions {
  disabled?: () => boolean

  remember?: boolean
}

export type FormInputPath = string | number | (string | number)[]

export interface FormControl<
  TValues extends VisitData = VisitData,
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

  submit(options?: FormSubmitOptions): Promise<Visit | undefined>

  validate(path: FormInputPath | InputEvent): Promise<void>

  reset(): void

  clear(): void

  set(values?: Partial<TValues>): void

  block(path: FormInputPath): void

  unblock(path: FormInputPath): void

  focus(path: FormInputPath): void

  blur(path: FormInputPath): void

  enable(): void

  disable(): void

  partial<TPartialValues extends VisitData>(
    getName: string | (() => string),
    getRoutable: Routable | (() => Routable),
    getInitialPartialValues: (values: TValues) => TPartialValues,
    options?: FormOptions,
  ): FormControl<TPartialValues>

  getInputId(path: FormInputPath | InputEvent): string

  getInputName(path: FormInputPath | InputEvent): string
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
