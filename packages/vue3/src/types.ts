import type Root from './components/Root'
import { FragmentContext } from './contexts/provideFragmentContext'
import type plugin from './plugin'
import {
  ComponentModuleResolver,
  RouterEventListener,
  RouterEventNames,
  Page,
  Fragments,
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
  FormDataConvertible,
} from '@navigare/core'
import { HeadClient } from '@vueuse/head'
import {
  InjectionKey,
  App as VueApp,
  DefineComponent,
  ComponentInternalInstance,
  UnwrapNestedRefs,
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
  fragment: ContextOf<typeof FragmentContext>
  fragments: Fragments
  processing: boolean
  visit(
    routable: Routable,
    options?: Exclude<VisitOptions, 'method' | 'data'>,
  ): Promise<Visit>
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

export type FormTransformer<TData, TTransformedData extends FormValues> = (
  data: TData,
) => TTransformedData

export type FormError = string | string[] | null | FormErrors

export interface FormErrors {
  [name: string]: FormError
}

export type FormEvents<TValues extends FormValues = FormValues> = {
  validate: {
    details: {
      values: TValues
      errors: FormErrors
    }
    result: void
  }

  before: {
    details: {}
    result: void
  }

  success: {
    details: {
      response: any
    }
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

export type FormBaseOptions<TValues extends FormValues = FormValues> = Partial<{
  parent: FormControl
  disabled: () => boolean
  remember: boolean
  transform: (values: TValues) => any
  events: {
    [TEventName in FormEventNames]: FormEventListener<TEventName>
  }
}>

export type FormVisitOptions<TValues extends FormValues = FormValues> =
  FormBaseOptions<TValues> & Omit<VisitOptions, 'events'>

export type FormOptions<
  TValues extends FormValues = FormValues,
  TRoutable extends Routable = never,
> = TRoutable extends never
  ? FormVisitOptions<TValues>
  : FormBaseOptions<TValues>

export type FormInputName = string | number

export type FormInputPath = FormInputName | FormInputName[]

export type FormTrigger =
  | Element
  | HTMLElement
  | ComponentInternalInstance
  | null

export type FormValue = FormDataConvertible | FormValues

export interface FormValues {
  [key: string]: FormValue
}

export interface FormControl<
  TValues extends FormValues = FormValues,
  // TTransformedValues extends FormValues = TValues,
> {
  name: string

  values: UnwrapNestedRefs<TValues>

  routable: Routable | null

  errors: FormErrors

  dirty: boolean

  blocked: boolean

  blockers: Record<string, boolean>

  processing: boolean

  disabled: boolean

  valid: boolean

  progress: VisitProgress | null

  trigger: FormTrigger | null

  submit(options?: FormSubmitOptions): Promise<Visit | undefined>

  validate(path: FormInputPath | InputEvent): Promise<void>

  reset(paths?: FormInputPath[]): void

  clearValues(paths?: FormInputPath[]): void

  setValue(path: FormInputPath, value: FormValue): void

  setValues(values: Partial<TValues>): void

  block(path: FormInputPath): void

  unblock(path: FormInputPath): void

  focus(path: FormInputPath): void

  blur(path: FormInputPath): void

  enable(): void

  disable(): void

  partial<TPartialValues extends FormValues>(
    getName: string | (() => string),
    getRoutable:
      | Routable
      | (() => Routable)
      | (() => (values: TPartialValues) => any | Promise<any>),
    getInitialPartialValues: (
      values: UnwrapNestedRefs<TValues>,
    ) => TPartialValues,
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

  setErrors(errors: FormErrors): void

  setError(path: FormInputPath, error?: FormError): void

  clearErrors(paths?: FormInputPath[]): void
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
