import type Root from './Root'
import type plugin from './plugin'
import { PageFragmentContext } from './providePageFragmentContext'
import {
  ComponentModuleResolver,
  RouterEventListener,
  RouterEventNames,
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
import {
  InjectionKey,
  App as VueApp,
  DefineComponent,
  ComponentInternalInstance,
} from 'vue'

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
  events?: RouterOptions<DefineComponent>['events']
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
  on<TEventName extends RouterEventNames>(
    name: TEventName,
    listener: RouterEventListener<TEventName>,
  ): () => void
  off<TEventName extends RouterEventNames>(
    name: TEventName,
    listener: RouterEventListener<TEventName>,
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

export type FormEvents = {
  success: {
    details: {}
    result: void
  }

  reset: {
    details: {}
    result: void
  }
}

export type FormEventNames = keyof FormEvents

export type FormEventDetails<TEventName extends FormEventNames> =
  FormEvents[TEventName]['details']

export type FormEventResult<TEventName extends FormEventNames> =
  FormEvents[TEventName]['result']

export type FormEvent<TEventName extends FormEventNames> = CustomEvent<
  FormEventDetails<TEventName>
>

export type FormEventListener<TEventName extends FormEventNames> = (
  event: FormEvent<TEventName>,
) => FormEventResult<TEventName>

export interface FormSubmitOptions {
  trigger?: FormTrigger
  resetAfterSuccess?: boolean
}

export type FormBaseOptions<TValues extends VisitData = VisitData> = {
  disabled?: () => boolean
  remember?: boolean
  transform?: (values: TValues) => any
}

export type FormVisitOptions<TValues extends VisitData = VisitData> =
  FormBaseOptions<TValues> & VisitOptions

export type FormOptions<
  TValues extends VisitData = VisitData,
  TRoutable extends Routable = never,
> = TRoutable extends never
  ? FormVisitOptions<TValues>
  : FormBaseOptions<TValues>

export type FormInputPath = string | number | (string | number)[]

export type FormTrigger =
  | Element
  | HTMLElement
  | ComponentInternalInstance
  | null

export interface FormControl<
  TValues extends VisitData = VisitData,
  // TTransformedValues extends VisitData = TValues,
> {
  name: string

  values: TValues

  routable: Routable | null

  errors: FormErrors

  dirty: boolean

  blocked: boolean

  blockers: Record<string, boolean>

  processing: boolean

  disabled: boolean

  progress: VisitProgress | null

  trigger: FormTrigger | null

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

  on<TEventName extends FormEventNames>(
    name: TEventName,
    listener: FormEventListener<TEventName>,
  ): () => void

  off<TEventName extends FormEventNames>(
    name: TEventName,
    listener: FormEventListener<TEventName>,
  ): void
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
