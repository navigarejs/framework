import PartialRoute from './PartialRoute'
import Route from './Route'
import {
  createBeforeEvent,
  createCancelEvent,
  createErrorEvent,
  createExceptionEvent,
  createFinishEvent,
  createInvalidEvent,
  createNavigateEvent,
  createProgressEvent,
  createStartEvent,
  createSuccessEvent,
} from './events'
import modal from './modal'
import {
  LocationVisit,
  RouteMethod,
  Page,
  VisitPreserveStateOption,
  QueryStringArrayFormat,
  VisitData,
  Routable,
  VisitId,
  VisitOptions,
  RouterLocation,
  RouterOptions,
  RouteDefaults,
  Events,
  EventNames,
  EventListener,
  RawRouteMethod,
  Event as RouterEvent,
  Visit,
  PageComponent,
} from './types'
import {
  isSSR,
  throwError,
  mergeDataIntoQueryString,
  mergePages,
  objectToFormData,
  hasFiles,
  createEmitter,
  mapRouteMethod,
  safeParse,
  serialize,
  getKeys,
  getDeferredPageProperties,
} from './utilities'
import {
  default as Axios,
  AxiosResponse,
  AxiosResponseHeaders,
  RawAxiosResponseHeaders,
  AxiosStatic,
} from 'axios'
import castArray from 'lodash.castarray'
import cloneDeep from 'lodash.clonedeep'
import debounce from 'lodash.debounce'
import isArray from 'lodash.isarray'
import isObject from 'lodash.isobject'
import isString from 'lodash.isstring'
import uniq from 'lodash.uniq'
import { SetRequired } from 'type-fest'

export default class Router<TComponentModule> {
  protected options: RouterOptions<TComponentModule>

  protected activeVisit: Visit

  protected internalPages: Page[] = []

  public get pages(): Page[] {
    return cloneDeep(this.internalPages).map((page, index) => {
      return {
        ...page,
        obsolete: index > this.pageIndex,
      }
    })
  }

  protected pageIndex = 0

  protected get internalPage(): Page {
    return this.internalPages[this.pageIndex]
  }

  protected set internalPage(nextPage: Page) {
    this.internalPages[this.pageIndex] = nextPage
  }

  public get page(): Page {
    return cloneDeep(this.internalPage)
  }

  protected get internalPreviousPage(): Page | undefined {
    return this.internalPages[this.pageIndex - 1]
  }

  public get previousPage(): Page | undefined {
    return cloneDeep(this.internalPreviousPage)
  }

  protected get internalLatestPage(): Page {
    return [...this.internalPages].sort((pageA, pageB) => {
      return pageB.timestamp - pageA.timestamp
    })[0]
  }

  public get latestPage(): Page {
    return cloneDeep(this.internalLatestPage)
  }

  public get location(): RouterLocation {
    return this.page.location
  }

  protected emitter = createEmitter<Events>()

  protected componentModules: Record<string, TComponentModule> = {}

  public axios: AxiosStatic

  public constructor(options: RouterOptions<TComponentModule>) {
    const { initialPage } = options
    this.options = options
    this.activeVisit = this.createVisit({
      location: initialPage.location,
    })
    this.setPage({
      ...initialPage,
      visit: this.activeVisit,
    })
    this.axios = Axios

    // Handle initial page
    if (!isSSR()) {
      setTimeout(() => {
        if (this.isBackForwardVisit()) {
          this.handleBackForwardVisit(this.page)
        } else if (this.isLocationVisit()) {
          this.handleLocationVisit(this.page)
        } else {
          this.handleInitialPageVisit(this.page)
        }

        // Listen to events
        this.setupEventListeners()
      }, 0)
    }

    // Listen to own exceptions
    this.on('exception', (event) => {
      console.error(event.detail.exception)
    })
  }

  protected async handleInitialPageVisit(page: Page): Promise<void> {
    page.location.hash = window.location.hash
  }

  protected setupEventListeners(): void {
    window.addEventListener('popstate', this.handlePopstateEvent.bind(this))

    document.addEventListener(
      'scroll',
      debounce(this.handleScrollEvent.bind(this), 100),
      true,
    )
  }

  protected scrollRegions(): NodeListOf<Element> {
    return document.querySelectorAll('[scroll-region]')
  }

  protected handleScrollEvent(event: Event): void {
    if (
      typeof (event.target as Element).hasAttribute === 'function' &&
      (event.target as Element).hasAttribute('scroll-region')
    ) {
      this.saveScrollPositions()
    }
  }

  protected saveScrollPositions(): void {
    this.replaceState({
      ...this.page,
      scrollRegions: Array.from(this.scrollRegions()).map((region) => {
        return {
          top: region.scrollTop,
          left: region.scrollLeft,
        }
      }),
    })
  }

  protected resetScrollPositions(): void {
    if (isSSR()) {
      return
    }

    window.scrollTo(0, 0)

    this.scrollRegions().forEach((region) => {
      if (typeof region.scrollTo === 'function') {
        region.scrollTo(0, 0)
      } else {
        region.scrollTop = 0
        region.scrollLeft = 0
      }
    })
    this.saveScrollPositions()

    if (window.location.hash) {
      document.getElementById(window.location.hash.slice(1))?.scrollIntoView()
    }
  }

  protected restoreScrollPositions(): void {
    if (!this.page.scrollRegions) {
      return
    }

    this.scrollRegions().forEach((region: Element, index: number) => {
      const scrollPosition = this.page.scrollRegions[index]
      if (!scrollPosition) {
        return
      } else if (typeof region.scrollTo === 'function') {
        region.scrollTo(scrollPosition.left, scrollPosition.top)
      } else {
        region.scrollTop = scrollPosition.top
        region.scrollLeft = scrollPosition.left
      }
    })
  }

  protected isBackForwardVisit(): boolean {
    return (
      window.history.state &&
      window.performance &&
      window.performance.getEntriesByType('navigation').length > 0 &&
      (
        window.performance.getEntriesByType(
          'navigation',
        )[0] as PerformanceNavigationTiming
      ).type === 'back_forward'
    )
  }

  protected async handleBackForwardVisit(page: Page): Promise<void> {
    window.history.state.version = page.version

    await this.setPage(window.history.state, {
      preserveScroll: true,
      preserveState: true,
    })

    this.restoreScrollPositions()
  }

  protected locationVisit(
    location: RouterLocation,
    preserveScroll: LocationVisit['preserveScroll'],
  ): boolean | void {
    try {
      const locationVisit: LocationVisit = { preserveScroll }

      window.sessionStorage.setItem(
        'navigareLocationVisit',
        serialize(locationVisit),
      )

      window.location.href = location.href

      if (this.createLocation(window.location.href).href === location.href) {
        window.location.reload()
      }
    } catch (error) {
      return false
    }
  }

  protected isLocationVisit(): boolean {
    try {
      return window.sessionStorage.getItem('navigareLocationVisit') !== null
    } catch (error) {
      return false
    }
  }

  protected async handleLocationVisit(page: Page): Promise<void> {
    const locationVisit: LocationVisit = JSON.parse(
      window.sessionStorage.getItem('navigareLocationVisit') || '',
    )

    window.sessionStorage.removeItem('navigareLocationVisit')

    page.location.hash = window.location.hash
    page.rememberedState = window.history.state?.rememberedState ?? {}
    page.scrollRegions = window.history.state?.scrollRegions ?? []

    await this.setPage(page, {
      preserveScroll: locationVisit.preserveScroll,
      preserveState: true,
    })

    if (locationVisit.preserveScroll) {
      this.restoreScrollPositions()
    }
  }

  protected isLocationVisitResponse(response: AxiosResponse): boolean {
    if (!response) {
      return false
    }

    if (response.status !== 409) {
      return false
    }

    return true
  }

  protected isNavigareResponse(
    response: AxiosResponse | undefined,
  ): response is AxiosResponse<Page> {
    if (!this.getHeader(response?.headers, 'X-Navigare')) {
      return false
    }

    return true
  }

  protected cancelVisit(visitId: VisitId, interrupt = false): void {
    if (this.activeVisit?.id !== visitId) {
      return
    }

    const { activeVisit } = this

    if (activeVisit.completed) {
      return
    }

    activeVisit.cancelToken?.cancel()
    activeVisit.completed = false
    activeVisit.cancelled = true
    activeVisit.interrupted = interrupt ? true : false

    this.emit('cancel', createCancelEvent(activeVisit), activeVisit.onCancel)
    this.emit('finish', createFinishEvent(activeVisit), activeVisit.onFinish)
  }

  protected finishVisit(visit: Visit): void {
    if (!visit.cancelled && !visit.interrupted) {
      visit.completed = true
      visit.cancelled = false
      visit.interrupted = false

      this.emit('finish', createFinishEvent(visit), visit.onFinish)
    }
  }

  protected resolvePreserveOption(
    value: VisitPreserveStateOption,
    page: Page,
  ): boolean | string {
    if (typeof value === 'function') {
      return value(page)
    }

    if (value === 'errors') {
      return Object.keys(page.properties.errors || {}).length > 0
    }

    return !!value
  }

  public async back(fallback?: Routable): Promise<void> {
    // In case we have no history, we allow the user to define a fallback route
    if (this.pageIndex - 1 < 0) {
      if (fallback) {
        await this.visit(fallback)
      } else {
        history.back()
      }

      return
    }

    // Inform listeners about new page
    history.back()
    /*this.pageIndex--
    this.emitter.emit(
      'navigate',
      createNavigateEvent(this.page, this.internalPages, this.pageIndex, false),
    )*/
  }

  public async visit(
    routable: Routable,
    options: VisitOptions = {},
  ): Promise<Visit> {
    let { preserveScroll = false, preserveState = false } = options
    const {
      replace = false,
      properties = [],
      headers = {},
      errorBag = '',
      forceFormData = false,
      queryStringArrayFormat = QueryStringArrayFormat.Brackets,
      onBefore,
      onStart,
      onProgress,
      onFinish,
      onCancel,
      onSuccess,
      onError,
      onInvalid,
      onException,
    } = options
    const { location, method, data } = this.resolveRoutable(
      routable,
      options.data,
      {
        method: options.method,
        forceFormData,
        queryStringArrayFormat,
      },
    )

    const visit: Visit = this.createVisit({
      location,
      method,
      data,
      replace,
      preserveScroll,
      preserveState,
      properties,
      headers,
      errorBag,
      forceFormData,
      queryStringArrayFormat,
    })

    if (!this.emit('before', createBeforeEvent(visit), onBefore)) {
      return this.activeVisit!
    }

    if (this.activeVisit) {
      this.cancelVisit(visit.id, true)
    }

    this.saveScrollPositions()

    this.activeVisit = {
      ...visit,
      onBefore,
      onStart,
      onProgress,
      onFinish,
      onCancel,
      onSuccess,
      onError,
      onException,
      onInvalid,
      queryStringArrayFormat,
      cancelToken: Axios.CancelToken.source(),
      cancel: () => {
        this.cancelVisit(visit.id)
      },
      interrupt: () => {
        this.cancelVisit(visit.id, true)
      },
    }

    this.emit('start', createStartEvent(this.activeVisit), onStart)

    try {
      const response = await this.axios({
        method,

        url: location.href,

        data: method === RouteMethod.GET ? {} : data,

        params: method === RouteMethod.GET ? data : {},

        cancelToken: this.activeVisit.cancelToken?.token,

        headers: {
          ...headers,
          Accept: 'text/html, application/xhtml+xml',
          'X-Requested-With': 'XMLHttpRequest',
          'X-Navigare': true,
          ...(properties.length
            ? {
                'X-Navigare-Select': properties,
              }
            : {}),
          ...(errorBag && errorBag.length
            ? { 'X-Navigare-Error-Bag': errorBag }
            : {}),
          ...(this.page.version
            ? { 'X-Navigare-Version': this.page.version }
            : {}),
        },

        onUploadProgress: (progress) => {
          if (data instanceof FormData) {
            this.emit(
              'progress',
              createProgressEvent(this.activeVisit!, progress),
              onProgress,
            )
          }
        },
      })

      if (!this.isNavigareResponse(response)) {
        return Promise.reject({ response })
      }

      // Prepare next page
      const nextPage: Page = {
        ...response.data,
        visit: this.activeVisit,
      }

      // Merge properties of fragments
      if (properties.length) {
        const selectedProperties = properties.map((property) => {
          if (property.includes('/')) {
            const [fragmentName, name] = property.split('/')

            return {
              fragmentName,
              name,
            }
          }

          return {
            fragmentName: 'default',
            name: property,
          }
        })
        const selectedFragments = uniq(
          selectedProperties.map((selectedProp) => {
            return selectedProp.fragmentName
          }),
        )

        for (const selectedFragmentName of selectedFragments) {
          const selectedFragment = nextPage.fragments[selectedFragmentName]
          const currentFragment = this.page.fragments[selectedFragmentName]

          if (isArray(selectedFragment)) {
            throwError('fragments from server cannot be arrays')
          }

          if (!selectedFragment) {
            throwError('fragments from server cannot be null')
          }

          if (isArray(currentFragment)) {
            selectedFragment.properties = {
              ...currentFragment[currentFragment.length - 1].properties,
              ...selectedFragment.properties,
            }
          } else if (currentFragment) {
            selectedFragment.properties = {
              ...currentFragment.properties,
              ...selectedFragment.properties,
            }
          }
        }

        nextPage.properties = {
          ...this.page.properties,
          ...nextPage.properties,
        }
      }

      // Check if we need to manually preserve the scroll area
      preserveScroll = this.resolvePreserveOption(preserveScroll, nextPage)

      // Check if we need to preserve the state
      preserveState = this.resolvePreserveOption(preserveState, nextPage)
      if (preserveState && window.history.state?.rememberedState) {
        nextPage.rememberedState = window.history.state.rememberedState
      }

      // In case the next location is the same as the current location, we will copy the hash
      if (
        location.hash &&
        !nextPage.location.hash &&
        location.href === nextPage.location.href
      ) {
        nextPage.location.hash = location.hash
      }

      // Set new page
      await this.setPage(nextPage, {
        replace,
        preserveScroll,
        preserveState,
      })

      // Check if any errors occurred
      const errors = this.page.properties.errors || {}
      if (Object.keys(errors).length > 0) {
        const scopedErrors = Object.fromEntries(
          Object.entries(
            errorBag ? (errors[errorBag] ? errors[errorBag] : {}) : errors,
          ).map(([name, message]) => {
            return [name, castArray(message)]
          }),
        )

        this.emit(
          'error',
          createErrorEvent(this.activeVisit, scopedErrors),
          onError,
        )
      } else {
        this.emit(
          'success',
          createSuccessEvent(this.activeVisit, this.page),
          onSuccess,
        )
      }
    } catch (error) {
      if (Axios.isAxiosError(error) && error.response) {
        if (this.isNavigareResponse(error.response)) {
          this.setPage(error.response.data)
        } else if (this.isLocationVisitResponse(error.response)) {
          const redirectHref = String(
            this.getHeader(error.response.headers, 'X-Navigare-Location'),
          )

          if (!redirectHref) {
            throw new Error(
              '"X-Navigare-Location" header is missing in response',
            )
          }

          // In case the redirect location points to the current location, we will restore the hash
          const redirectLocation = this.createLocation(redirectHref)
          if (
            location.hash &&
            !redirectLocation.hash &&
            location.href === redirectLocation.href
          ) {
            redirectLocation.hash = location.hash
          }

          this.locationVisit(redirectLocation, preserveScroll === true)
        } else if (
          this.emit(
            'invalid',
            createInvalidEvent(this.activeVisit, error.response),
            onInvalid,
          )
        ) {
          modal.show(error.response.data as any)
        }
      }

      this.emit(
        'exception',
        createExceptionEvent(this.activeVisit, error as Error),
        onException,
      )
    }

    this.finishVisit(this.activeVisit)

    return this.activeVisit
  }

  protected getHeader(
    headers: RawAxiosResponseHeaders | AxiosResponseHeaders | undefined,
    name: string,
  ): string | string[] | number | boolean | null | undefined {
    if (!headers) {
      return undefined
    }

    return headers[name.toLowerCase()]
  }

  protected async setPage(
    page: Page,
    {
      replace = false,
      preserveScroll = false,
    }: {
      replace?: boolean
      preserveScroll?: VisitPreserveStateOption
      preserveState?: VisitPreserveStateOption
    } = {},
  ): Promise<Page> {
    const initialVisit = !this.page

    // Merge current and incoming page into next page
    const pageWithBase = mergePages(
      page.base,
      {
        ...page,
        base: undefined,
      },
      this.options.fragments,
      initialVisit,
    )
    const nextPage = mergePages(this.page, pageWithBase, this.options.fragments)

    // Reuse or initialize scroll regions and state
    nextPage.scrollRegions = nextPage.scrollRegions || []
    nextPage.rememberedState = nextPage.rememberedState || {}

    // Either replace the current state or push the next state
    if (
      replace ||
      (!isSSR() && nextPage.location.href === window.location.href)
    ) {
      this.replaceState(nextPage)
    } else {
      this.pushState(nextPage)
    }

    // Reset scroll if requested
    if (!preserveScroll) {
      this.resetScrollPositions()
    }

    // Inform listeners about new page
    if (!initialVisit) {
      this.emitter.emit(
        'navigate',
        createNavigateEvent(
          this.page,
          this.internalPages,
          this.pageIndex,
          replace,
        ),
      )
    }

    // Load deferred properties in the background
    const deferredProperties = getDeferredPageProperties(this.page)
    if (getKeys(deferredProperties).length > 0) {
      setTimeout(() => {
        this.reload({
          headers: {
            'X-Navigare-Properties': getKeys(deferredProperties).join(','),
          },
        })
      }, 1)
    }

    return nextPage
  }

  protected pushState(page: Page): void {
    // Increase the page index and store the new page
    this.pageIndex++
    this.internalPages.length = this.pageIndex + 1
    this.internalPages[this.pageIndex] = page

    if (!isSSR()) {
      window.history.pushState(serialize(page), '', page.location.href)
    }
  }

  protected replaceState(page: Page): void {
    // Simply replace the page at the current page index
    this.internalPage = page

    if (!isSSR()) {
      window.history.replaceState(serialize(page), '', page.location.href)
    }
  }

  protected getComponentId(component: PageComponent): string {
    return component.id
  }

  public getComponentModule(
    component: PageComponent,
  ): TComponentModule | Promise<TComponentModule> {
    const id = this.getComponentId(component)

    // If the component was loaded before we can simply return it's instance
    if (id in this.componentModules) {
      return this.componentModules[this.getComponentId(component)]
    }

    // Otherwise we will resolve it asynchronously
    return new Promise<TComponentModule>(async (resolve) => {
      const module = (await this.resolveComponentModule(component)) as any

      // Remember that we used the module before
      this.componentModules[id] = 'default' in module ? module.default : module

      resolve(this.componentModules[id])
    })
  }

  public async resolveComponentModule(component: PageComponent) {
    const resolveComponentModule =
      this.options.resolveComponentModule ||
      (async (url) => {
        return import(/* @vite-ignore */ url)
      })

    const url = component.path.startsWith('/')
      ? component.path
      : [this.options.base, component.path].join('')

    return await resolveComponentModule(url, component)
  }

  public async resolvePage(page: Page): Promise<void> {
    const components = Object.values(page.fragments).reduce(
      (cumulatedComponents, fragments) => {
        if (!fragments) {
          return cumulatedComponents
        }

        return [
          ...cumulatedComponents,
          ...(isArray(fragments)
            ? fragments.map((fragment) => fragment.component)
            : [fragments.component]),
        ]
      },
      [] as PageComponent[],
    )

    await Promise.all(
      components.map(async (component) => {
        return await this.getComponentModule(component)
      }),
    )

    if (page.base) {
      await this.resolvePage(page.base)
    }
  }

  protected async handlePopstateEvent(event: PopStateEvent): Promise<void> {
    const nextPage = safeParse<Page>(event.state)

    if (!nextPage) {
      history.back()
      return
    }

    // Try to find page via visit id
    const nextPageIndex = nextPage
      ? this.internalPages.findIndex((page) => {
          return page.visit.id === nextPage.visit.id
        })
      : -1

    // In case we cannot find it, it belongs to a session before a refresh
    if (nextPageIndex < 0) {
      window.location.reload()
      /*this.replaceState(nextPage)
      this.resetScrollPositions()*/
    } else {
      this.pageIndex = nextPageIndex

      this.restoreScrollPositions()
    }

    this.emitter.emit(
      'navigate',
      createNavigateEvent(this.page, this.internalPages, this.pageIndex, false),
    )
  }

  public async reload(
    options: Exclude<VisitOptions, 'preserveScroll' | 'preserveState'> = {},
  ): Promise<Visit> {
    return await this.visit(window.location.href, {
      ...options,
      preserveScroll: true,
      preserveState: true,
    })
  }

  public async get(
    routable: Routable,
    data: VisitData = {},
    options: Exclude<VisitOptions, 'method' | 'data'> = {},
  ): Promise<Visit> {
    return await this.visit(routable, {
      ...options,
      method: 'GET',
      data,
    })
  }

  public async post(
    routable: Routable,
    data: VisitData = {},
    options: Exclude<VisitOptions, 'method' | 'data'> = {},
  ): Promise<Visit> {
    return await this.visit(routable, {
      preserveState: true,
      ...options,
      method: 'POST',
      data,
    })
  }

  public async put(
    routable: Routable,
    data: VisitData = {},
    options: Exclude<VisitOptions, 'method' | 'data'> = {},
  ): Promise<Visit> {
    return await this.visit(routable, {
      preserveState: true,
      ...options,
      method: 'PUT',
      data,
    })
  }

  public async patch(
    routable: Routable,
    data: VisitData = {},
    options: Exclude<VisitOptions, 'method' | 'data'> = {},
  ): Promise<Visit> {
    return await this.visit(routable, {
      preserveState: true,
      ...options,
      method: 'PATCH',
      data,
    })
  }

  public async delete(
    routable: Routable,
    options: Exclude<VisitOptions, 'method'> = {},
  ): Promise<Visit> {
    return await this.visit(routable, {
      preserveState: true,
      ...options,
      method: 'DELETE',
    })
  }

  public remember(data: unknown, key = 'default'): void {
    this.replaceState({
      ...this.page,
      rememberedState: {
        ...this.page.rememberedState,
        [key]: cloneDeep(data),
      },
    })
  }

  public restore(key = 'default'): unknown {
    if (isSSR()) {
      return
    }

    const page = safeParse<Page>(window.history.state)

    return page?.rememberedState?.[key]
  }

  public resolveRoutable(
    routable: Routable,
    data: VisitData = {},
    options: {
      method?: RawRouteMethod
      forceFormData?: boolean
      queryStringArrayFormat?: QueryStringArrayFormat
    } = {
      queryStringArrayFormat: QueryStringArrayFormat.Brackets,
    },
  ): {
    method: RouteMethod
    location: RouterLocation
    data: VisitData
    components: PageComponent[]
  } {
    let finalHref =
      routable instanceof URL
        ? routable.href
        : routable instanceof Route || isObject(routable)
        ? routable.getHref(
            this.location,
            data instanceof FormData ? {} : data,
            {
              queryStringArrayFormat: options.queryStringArrayFormat,
            },
          )
        : routable
    let finalData = data
    let method =
      routable instanceof Route
        ? routable.method
        : mapRouteMethod(options.method) ?? RouteMethod.GET
    const components = routable instanceof Route ? routable.components : []

    // Check if the route was resolved
    if (!finalHref) {
      throwError(
        `the routable "${JSON.stringify(
          routable,
        )}" could not be resolved properly`,
      )
    }

    // Check if there is potentially an issue with the setup
    if (
      isObject(routable) &&
      !(routable instanceof Route) &&
      !(routable instanceof URL)
    ) {
      console.warn(
        `It seems that there is an issue with Navigare. Maybe you have two different versions of \`@navigare/core\` installed?`,
      )
    }

    if (
      (hasFiles(data) || options.forceFormData) &&
      !(data instanceof FormData)
    ) {
      finalData = objectToFormData(data)
    }

    // During form submissions replace method with POST to allow file uploads
    if (finalData instanceof FormData) {
      finalData.append('_method', method)
      method = RouteMethod.POST
    } else {
      // Otherwise merge data into query string
      const merged = mergeDataIntoQueryString(
        method,
        finalHref,
        finalData,
        options.queryStringArrayFormat,
      )

      finalHref = merged.href
      finalData = merged.data
    }

    return {
      method,
      location: this.createLocation(finalHref),
      data: finalData,
      components,
    }
  }

  protected createVisit(visit: SetRequired<Partial<Visit>, 'location'>): Visit {
    return {
      id: Math.random().toString(36),
      method: RouteMethod.GET,
      data: {},
      replace: false,
      preserveScroll: false,
      preserveState: false,
      properties: [],
      headers: {},
      errorBag: null,
      forceFormData: false,
      queryStringArrayFormat: QueryStringArrayFormat.Brackets,
      completed: true,
      cancelled: false,
      interrupted: false,
      ...visit,
    }
  }

  protected createLocation(href: string): RouterLocation {
    const url = new URL(href, this.location.href)

    // Create version without hash
    const urlWithoutHash = new URL(url)
    urlWithoutHash.hash = ''

    return {
      href: urlWithoutHash.href,
      host: url.host,
      hostname: url.hostname,
      origin: url.origin,
      pathname: url.pathname,
      port: url.port,
      protocol: url.protocol,
      search: url.search,
      hash: url.hash,
    }
  }

  public match(
    comparableRoute: Routable | PartialRoute,
    route: Route,
    location: RouterLocation,
    defaults: RouteDefaults,
  ): boolean {
    // Check if the route matches the other route
    return route.match(comparableRoute, location, defaults)
  }

  public on<TEventName extends EventNames>(
    name: TEventName,
    listener: EventListener<TEventName>,
  ): () => void {
    return this.emitter.on(name, listener)
  }

  public off<TEventName extends EventNames>(
    name: TEventName,
    listener: EventListener<TEventName>,
  ): void {
    return this.emitter.off(name, listener)
  }

  public emit<TEventName extends EventNames>(
    name: TEventName,
    event: RouterEvent<TEventName>,
    localListener?: EventListener<TEventName>,
  ): boolean {
    if (localListener) {
      localListener(event)

      if (event.cancelable && event.defaultPrevented) {
        return false
      }
    }

    return this.emitter.emit(name, event as any)
  }

  public isRoutable(routable: any): routable is Routable {
    return (
      routable instanceof Route || routable instanceof URL || isString(routable)
    )
  }
}
