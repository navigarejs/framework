import type Root from './components/Root'
import type plugin from './plugin'
import {
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
  PageErrors,
  DefaultPageProperties,
} from '@navigare/core'
import { HeadClient } from '@vueuse/head'
import {
  InjectionKey,
  App as VueApp,
  DefineComponent,
  ComponentInternalInstance,
  UnwrapNestedRefs,
  Ref,
} from 'vue'

export type App = {
  root: VueApp
  page: Page
  id: string
  head: HeadClient
}

export type Options = {
  id?: string
  setup: Setup
} & Omit<RouterOptions<DefineComponent>, 'base' | 'initialPage'>

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
  fragment: FragmentControl
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

// Fragments
export type FragmentControl = {
  name: string | null
  properties: Page['properties'] & Record<string, any>
  rawRoute: Page['rawRoute']
  parameters: Page['parameters']
  defaults: Page['defaults']
  location: Page['location']
  visit: Page['visit']
  exposed: Record<string, any>
  key: string | null
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

export type FormError = string | string[] | null

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
      flash: DefaultPageProperties['__flash']
    }
    result: void
  }

  error: {
    details: {
      errors: PageErrors
    }
    result: void
  }

  reset: {
    details: {}
    result: void
  }

  change: {
    details: {
      values: UnwrapNestedRefs<TValues>
    }
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

export type FormValidationOptions =
  | boolean
  | Partial<{
      on: 'input' | 'change' | false
      debounce: number
    }>

export type FormSubmitOptions = Partial<{
  trigger: FormTrigger
  background: boolean
  disable: boolean
}>

export type FormBaseOptions<TValues extends FormValues = FormValues> = Partial<{
  disabled: boolean | (() => boolean)
  remember: boolean
  reset: boolean
  transform: (values: TValues) => any | Promise<any>
  events: Partial<{
    [TEventName in FormEventNames]: FormEventListener<TEventName>
  }>
  validation: FormValidationOptions
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

export type FormInputPath = FormInputName[]

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

  options: {
    validation: FormValidationOptions
  }

  values: UnwrapNestedRefs<TValues>

  initialValues: Ref<UnwrapNestedRefs<TValues>>

  routable: Routable | null

  errors: FormErrors

  dirty: boolean

  focused: FormInputName | null

  successful: boolean | undefined

  recentlySuccessful: boolean | undefined

  blocked: boolean

  blockers: Record<string, boolean>

  processing: boolean

  disabled: boolean

  valid: boolean

  progress: VisitProgress | null

  trigger: FormTrigger | null

  submit(options?: FormSubmitOptions): Promise<Visit | undefined>

  validate(path: FormInputName | FormInputPath | InputEvent): Promise<void>

  reset(paths?: FormInputPath[]): void

  clearValues(paths?: FormInputPath[]): void

  setValue(path: FormInputPath, value: FormValue): void

  setValues(values: Partial<TValues>): void

  block(path: FormInputName | FormInputPath): void

  unblock(path: FormInputName | FormInputPath): void

  focus(path: FormInputName | FormInputPath): void

  blur(path: FormInputName | FormInputPath): void

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

  getInputId(path: FormInputName | FormInputPath | InputEvent): string

  getInputName(path: FormInputName | FormInputPath | InputEvent): string

  on<TEventName extends FormEventNames>(
    name: TEventName,
    listener: FormEventListener<TEventName>,
  ): () => void

  off<TEventName extends FormEventNames>(
    name: TEventName,
    listener: FormEventListener<TEventName>,
  ): void

  setErrors(errors: FormErrors): void

  setError(path: FormInputName | FormInputPath, error?: FormError): void

  clearErrors(paths?: (FormInputName | FormInputPath)[]): void
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
