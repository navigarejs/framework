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
  ActiveVisit,
  LocationVisit,
  RouteMethod,
  Page,
  PendingVisit,
  VisitPreserveStateOption,
  QueryStringArrayFormat,
  VisitData,
  Routable,
  VisitId,
  VisitOptions,
  RawRoutes,
  RouterLocation,
  PageFragments,
  RouterOptions,
  RouteName,
  RouteDefaults,
  Events,
  EventNames,
  EventListener,
  RawRouteMethod,
  Event as RouterEvent,
} from './types'
import {
  isSSR,
  resolveComponents,
  throwError,
  mergeDataIntoQueryString,
  urlWithoutHash,
  getInitialFragments,
  mergeFragments,
  objectToFormData,
  hasFiles,
  createEmitter,
  mapRouteMethod,
  safe,
} from './utilities'
import {
  default as Axios,
  AxiosResponse,
  AxiosResponseHeaders,
  RawAxiosResponseHeaders,
} from 'axios'
import cloneDeep from 'lodash.clonedeep'
import debounce from 'lodash.debounce'
import isArray from 'lodash.isarray'
import isObject from 'lodash.isobject'
import uniq from 'lodash.uniq'

export default class Router<TComponent> {
  protected options: RouterOptions<TComponent>

  protected rawRoutes: RawRoutes = {}

  protected activeVisit?: ActiveVisit

  protected internalPages: Page[] = []

  public get pages(): Page[] {
    return cloneDeep(this.internalPages)
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
    return this.internalPages.sort((pageA, pageB) => {
      return pageB.timestamp - pageA.timestamp
    })[0]
  }

  public get latestPage(): Page {
    return cloneDeep(this.internalLatestPage)
  }

  public get location(): RouterLocation {
    return this.page.location
  }

  protected internalComponents: Record<string, TComponent> = {}

  public get components(): Record<string, TComponent> {
    return this.internalComponents
  }

  protected emitter = createEmitter<Events>()

  public constructor(options: RouterOptions<TComponent>) {
    const { initialPage, initialComponents } = options
    this.options = options
    this.internalComponents = initialComponents
    this.internalPages.push({
      ...initialPage,
      visitId: this.createVisitId(),
    })

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
    url: URL,
    preserveScroll: LocationVisit['preserveScroll'],
  ): boolean | void {
    try {
      const locationVisit: LocationVisit = { preserveScroll }

      window.sessionStorage.setItem(
        'navigareLocationVisit',
        JSON.stringify(locationVisit),
      )

      window.location.href = url.href

      if (urlWithoutHash(window.location).href === urlWithoutHash(url).href) {
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

  protected createVisitId(): VisitId {
    return Math.random().toString(36)
  }

  protected cancelVisit(visitId: VisitId, interrupt = false): void {
    if (this.activeVisit?.id !== visitId) {
      return
    }

    const { activeVisit } = this

    if (activeVisit.completed) {
      return
    }

    activeVisit.cancelToken.cancel()
    activeVisit.completed = false
    activeVisit.cancelled = true
    activeVisit.interrupted = interrupt ? true : false

    this.emit('cancel', createCancelEvent(activeVisit), activeVisit.onCancel)
    this.emit('finish', createFinishEvent(activeVisit), activeVisit.onFinish)
  }

  protected finishVisit(visit: ActiveVisit): void {
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
      return Object.keys(page.props.errors || {}).length > 0
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
    this.pageIndex--
    this.emitter.emit(
      'navigate',
      createNavigateEvent(this.page, this.internalPages, this.pageIndex, false),
    )
  }

  public async visit(
    routable: Routable,
    options: VisitOptions = {},
  ): Promise<ActiveVisit> {
    let { preserveScroll = false } = options
    const {
      data = {},
      replace = false,
      preserveState = false,
      props = [],
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
    const { url, method } = this.resolveRoutable(routable, data, {
      method: options.method,
      forceFormData,
      queryStringArrayFormat,
    })

    const visitId = this.createVisitId()
    const visit: PendingVisit = {
      id: visitId,
      url,
      method,
      data,
      replace,
      preserveScroll,
      preserveState,
      props,
      headers,
      errorBag,
      forceFormData,
      queryStringArrayFormat,
      cancelled: false,
      completed: false,
      interrupted: false,
    }

    if (!this.emit('before', createBeforeEvent(visit), onBefore)) {
      return this.activeVisit!
    }

    if (this.activeVisit) {
      this.cancelVisit(visitId, true)
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
        this.cancelVisit(visitId)
      },
      interrupt: () => {
        this.cancelVisit(visitId, true)
      },
    }

    this.emit('start', createStartEvent(visit), onStart)

    try {
      const response = await Axios({
        method,

        url: urlWithoutHash(url).href,

        data: method === RouteMethod.GET ? {} : data,

        params: method === RouteMethod.GET ? data : {},

        cancelToken: this.activeVisit.cancelToken.token,

        headers: {
          ...headers,
          Accept: 'text/html, application/xhtml+xml',
          'X-Requested-With': 'XMLHttpRequest',
          'X-Navigare': true,
          ...(props.length
            ? {
                'X-Navigare-Props': props,
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
            this.emit('progress', createProgressEvent(progress), onProgress)
          }
        },
      })

      if (!this.isNavigareResponse(response)) {
        return Promise.reject({ response })
      }

      const nextPage: Page = response.data

      // Merge props of fragments
      if (props.length) {
        const selectedProps = props.map((prop) => {
          if (prop.includes('/')) {
            const [fragmentName, name] = prop.split('/')

            return {
              fragmentName,
              name,
            }
          }

          return {
            fragmentName: 'default',
            name: prop,
          }
        })
        const selectedFragments = uniq(
          selectedProps.map((selectedProp) => {
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
            selectedFragment.props = {
              ...currentFragment[currentFragment.length - 1].props,
              ...selectedFragment.props,
            }
          } else if (currentFragment) {
            selectedFragment.props = {
              ...currentFragment.props,
              ...selectedFragment.props,
            }
          }
        }

        nextPage.props = { ...this.page.props, ...nextPage.props }
      }

      // Check if we need to manually preserve the scroll area
      preserveScroll = this.resolvePreserveOption(preserveScroll, nextPage)

      /*
      TODO
      preserveState = this.resolvePreserveOption(preserveState, nextPage)
      if (
        preserveState &&
        window.history.state?.rememberedState &&
        nextPage.component === this.page.component
      ) {
        nextPage.rememberedState = window.history.state.rememberedState
      }*/

      const requestUrl = url
      const responseUrl = new URL(nextPage.location.href, this.location.href)
      if (
        requestUrl.hash &&
        !responseUrl.hash &&
        urlWithoutHash(requestUrl).href === responseUrl.href
      ) {
        responseUrl.hash = requestUrl.hash
        nextPage.location = responseUrl
      }

      await this.setPage(nextPage, {
        visitId,
        replace,
        preserveScroll,
        preserveState,
      })

      const errors = this.page.props.errors || {}
      if (Object.keys(errors).length > 0) {
        const scopedErrors = errorBag
          ? errors[errorBag]
            ? errors[errorBag]
            : {}
          : errors

        this.emit('error', createErrorEvent(scopedErrors), onError)
      } else {
        this.emit('success', createSuccessEvent(this.page), onSuccess)
      }
    } catch (error) {
      if (Axios.isAxiosError(error) && error.response) {
        if (this.isNavigareResponse(error.response)) {
          this.setPage(error.response.data, { visitId })
        } else if (this.isLocationVisitResponse(error.response)) {
          const locationHref = this.getHeader(
            error.response.headers,
            'X-Navigare-Location',
          )

          if (!locationHref) {
            throw new Error(
              '"X-Navigare-Location" header is missing in response',
            )
          }

          const locationUrl = new URL(String(locationHref), this.location.href)
          const requestUrl = url

          if (
            requestUrl.hash &&
            !locationUrl.hash &&
            urlWithoutHash(requestUrl).href === locationUrl.href
          ) {
            locationUrl.hash = requestUrl.hash
          }

          this.locationVisit(locationUrl, preserveScroll === true)
        } else if (
          this.emit('invalid', createInvalidEvent(error.response), onInvalid)
        ) {
          modal.show(error.response.data as any)
        }
      }

      this.finishVisit(this.activeVisit)

      throw error
    }

    try {
      if (this.activeVisit) {
        this.finishVisit(this.activeVisit)
      }
    } catch (error) {
      if (!Axios.isCancel(error)) {
        const throwException = this.emit(
          'exception',
          createExceptionEvent(error as Error),
          onException,
        )

        if (this.activeVisit) {
          this.finishVisit(this.activeVisit)
        }

        if (throwException) {
          throw error
        }
      }
    }

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

  protected mergeFragments(
    fragments: PageFragments,
    nextFragments: PageFragments,
  ): PageFragments {
    const initialFragments = getInitialFragments(this.options.fragments)

    return mergeFragments(
      mergeFragments(initialFragments, fragments),
      nextFragments,
    )
  }

  protected async setPage(
    page: Page,
    {
      visitId = this.createVisitId(),
      replace = false,
      preserveScroll = false,
    }: {
      visitId?: VisitId
      replace?: boolean
      preserveScroll?: VisitPreserveStateOption
      preserveState?: VisitPreserveStateOption
    } = {},
  ): Promise<void> {
    const nextPage: Page = {
      ...page,
      visitId,
      fragments: this.mergeFragments(this.page.fragments, page.fragments),
    }

    // Resolve components
    await this.resolveComponents(nextPage)

    nextPage.scrollRegions = nextPage.scrollRegions || []
    nextPage.rememberedState = nextPage.rememberedState || {}

    if (replace || nextPage.location.href === window.location.href) {
      this.replaceState(nextPage)
    } else {
      this.pushState(nextPage)
    }

    if (!preserveScroll) {
      this.resetScrollPositions()
    }

    // Inform listeners about new page
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

  protected pushState(page: Page): void {
    this.pageIndex++
    this.internalPages.length = this.pageIndex + 1
    this.internalPages[this.pageIndex] = page

    window.history.pushState(page, '', page.location.href)
  }

  protected replaceState(page: Page): void {
    this.internalPage = page

    window.history.replaceState(page, '', page.location.href)
  }

  protected async resolveComponents(
    page: Page,
  ): Promise<Record<string, TComponent>> {
    const components = await resolveComponents(
      this.options.resolveComponent,
      page,
    )

    this.internalComponents = {
      ...this.internalComponents,
      ...components,
    }

    return components
  }

  protected async handlePopstateEvent(event: PopStateEvent): Promise<void> {
    const { state: nextPage } = event

    if (!nextPage) {
      history.back()
      return
    }

    // Ensure that we have all components
    await this.resolveComponents(nextPage)

    // Try to find page via visit id
    const nextPageIndex = nextPage
      ? this.internalPages.findIndex((page) => {
          return page.visitId === nextPage.visitId
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
  ): Promise<ActiveVisit> {
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
  ): Promise<ActiveVisit> {
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
  ): Promise<ActiveVisit> {
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
  ): Promise<ActiveVisit> {
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
  ): Promise<ActiveVisit> {
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
  ): Promise<ActiveVisit> {
    return await this.visit(routable, {
      preserveState: true,
      ...options,
      method: 'DELETE',
    })
  }

  public remember(data: unknown, key = 'default'): void {
    if (isSSR()) {
      return
    }

    this.replaceState({
      ...this.page,
      rememberedState: {
        ...this.page?.rememberedState,
        [key]: data,
      },
    })
  }

  public restore(key = 'default'): unknown | undefined {
    if (isSSR()) {
      return
    }

    return window.history.state?.rememberedState?.[key]
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
    url: URL
    href: string
    data: VisitData
    components: string[]
  } {
    let finalHref =
      routable instanceof URL
        ? routable.href
        : routable instanceof Route || isObject(routable)
        ? safe(() => {
            return routable.getHref(
              this.location,
              data instanceof FormData ? {} : data,
              {
                queryStringArrayFormat: options.queryStringArrayFormat,
              },
            )
          })
        : routable
    let finalData = data
    const method =
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
    if (isObject(routable) && !(routable instanceof Route)) {
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

    if (!(finalData instanceof FormData)) {
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
      url: new URL(finalHref, this.location.href),
      href: finalHref,
      data: finalData,
      components,
    }
  }

  public matches(
    comparableRoute: Routable | PartialRoute<RouteName>,
    route: Route<RouteName>,
    defaults: RouteDefaults,
  ): boolean {
    // Check if the route matches the other route
    return route.matches(comparableRoute, defaults)
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
}
