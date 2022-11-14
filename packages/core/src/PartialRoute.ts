import { Default, Wildcard } from './symbols'
import {
  RouteMethod,
  RouteParameters,
  RawRoute,
  RouteName,
  RawRouteParameters,
  RouteDefaults,
  Routable,
  PageComponent,
  RouterLocation,
} from './types'
import { getKeys, isNotNull, mapRouteMethod, throwError } from './utilities'
import get from 'lodash.get'
import isBoolean from 'lodash.isboolean'
import isObject from 'lodash.isobject'
import isString from 'lodash.isstring'
import isSymbol from 'lodash.issymbol'
import { parse } from 'qs'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default class PartialRoute<TName extends RouteName = RouteName> {
  protected rawRoute: RawRoute

  public parameters: RawRouteParameters<TName>

  public partial = true

  public constructor(
    rawRoute: RawRoute,
    parameters: RawRouteParameters<TName>,
  ) {
    if (!isObject(rawRoute)) {
      throwError(`"${rawRoute}" is not a valid route`)
    }

    this.rawRoute = rawRoute
    this.parameters = parameters
  }

  public get method(): RouteMethod {
    return mapRouteMethod(this.rawRoute.method ?? this.rawRoute.methods[0])
  }

  public get name(): TName {
    return this.rawRoute.name
  }

  public get components(): PageComponent[] {
    return this.rawRoute.components ?? []
  }

  /**
   * Get the parameters
   */
  public getParameters(defaults: RouteDefaults = {}): RouteParameters<TName> {
    return Object.fromEntries(
      Object.entries(this.parameters)
        .map(
          ([key, value]):
            | [string, string | number | null | undefined | object | boolean]
            | null => {
            if (typeof value === 'symbol') {
              if (value === Default) {
                return [key, get(defaults, key)]
              }

              return null
            }

            if (value === null) {
              return null
            }

            if (isBoolean(value)) {
              return null
            }

            if (isSymbol(value)) {
              if (value === Default) {
                return [key, get(defaults, key)]
              }

              return null
            }

            if (isObject(value)) {
              const binding =
                'bindings' in this.rawRoute
                  ? get(this.rawRoute.bindings, key)
                  : null

              if (binding) {
                const boundValue = get(value, binding)

                if (!boundValue) {
                  throwError(
                    `an object was passed to parameter "${key}" but it is missing the property "${binding}"`,
                  )
                }

                return [key, String(boundValue)]
              }

              return [key, value]
            }

            return [key, value]
          },
        )
        .filter(isNotNull),
    ) as RouteParameters<TName>
  }

  /**
   * Get the parameters
   */
  public getQueryParameters(
    location: RouterLocation,
    defaults: RouteDefaults = {},
    absolute: boolean,
  ): Record<string, string> {
    return getKeys({
      ...defaults,
      ...this.parameters,
    })
      .filter(
        (key) =>
          !this.getParameterSegments(location, absolute).some(
            ({ name }) => name === key,
          ),
      )
      .filter((key) => key !== '_query')
      .reduce(
        (result, key) => ({
          ...result,
          [key]: get(this.parameters, key),
        }),
        {},
      )
  }

  /**
   * Get an array of objects representing the parameters that this route accepts.
   *
   * @example
   * [{ name: 'team', required: true }, { name: 'user', required: false }]
   */
  getParameterSegments(location: RouterLocation, absolute: boolean) {
    const template = this.getTemplate(location, absolute)

    return (
      template.match(/{[^}?]+\??}/g)?.map((segment) => ({
        name: segment.replace(/{|\??}/g, ''),
        required: !/\?}$/.test(segment),
      })) ?? []
    )
  }

  /**
   * Get a 'template' of the complete URL for this route.
   *
   * @example
   * https://{user}.github.io/{repository}
   */
  getTemplate(location: RouterLocation, absolute: boolean): string {
    // If we're building just a path there's no origin, otherwise: if this route has a
    // domain configured we construct the origin with that, if not we use the app URL
    const origin = this.rawRoute.domain
      ? `${location.protocol}://${this.rawRoute.domain}${
          location.port ? `:${location.port}` : ''
        }`
      : absolute
      ? location.origin
      : ''

    return `${origin}/${this.rawRoute.uri}`.replace(/\/+$/, '') || '/'
  }

  /**
   * Check if the route matches the given route
   */
  public match(
    comparableRoute: Routable | PartialRoute<RouteName>,
    location: RouterLocation,
    defaults: RouteDefaults = {},
  ): boolean {
    // Test the passed name against the route, matching some
    // basic wildcards, e.g. passing `events.*` matches `events.show`
    if (isString(comparableRoute) && !comparableRoute.startsWith('http')) {
      const match = new RegExp(
        `^${comparableRoute.replace(/\./g, '\\.').replace(/\*/g, '.*')}$`,
      ).test(this.name)

      return match
    }

    // Checking an URL against this route
    if (isString(comparableRoute) || comparableRoute instanceof URL) {
      const comparableURL = isString(comparableRoute)
        ? new URL(comparableRoute, location.href)
        : comparableRoute

      // Transform the route's template into a regex that will match a hydrated URL,
      // by replacing its parameter segments with matchers for parameter values
      const { wheres = {} } = this.rawRoute
      const pattern = this.getTemplate(location, true)
        .replace(/(\/?){([^}?]*)(\??)}/g, (_, slash, segment, optional) => {
          const regex = `(?<${segment}>${
            wheres[segment]?.replace(/(^\^)|(\$$)/g, '') || '[^/?]+'
          })`
          return optional ? `(${slash}${regex})?` : `${slash}${regex}`
        })
        .replace(/^\w+:\/\//, '')

      // Compare everything until the query string
      const [path] = comparableURL.href.replace(/^\w+:\/\//, '').split('?')
      const matches = new RegExp(`^${pattern}/?$`).exec(path)

      if (!matches) {
        return false
      }

      // And then compare query parameters
      const query = this.getQueryParameters(location, defaults, true)
      const comparableParameters = parse(comparableURL.search.substring(1))
      return getKeys({
        ...query,
        ...comparableParameters,
      }).every((key) => {
        return String(query[key]) === String(get(comparableParameters, key))
      })
    }

    // Now we deal with Route instances
    const parameters = this.getParameters(defaults)
    const comparableParameters = comparableRoute.getParameters()
    const comparableRawParameters = comparableRoute.parameters

    // Simple check by comparing the name
    if (this.rawRoute.name !== comparableRoute.name) {
      return false
    }

    return getKeys(this.parameters).every((key) => {
      // Check if the parameter in general exists (Symbols are excluded in getParameters)
      if (!(key in comparableRawParameters)) {
        return false
      }

      // Check for wild cards
      if (get(this.parameters, key) === Wildcard) {
        return true
      }

      if (get(comparableRawParameters, key) === Wildcard) {
        return true
      }

      // Otherwise compare stringified equality (like it would in the URL itself)
      return String(parameters[key]) === String(get(comparableParameters, key))
    })

    /*// Transform the route's template into a regex that will match a hydrated URL,
    // by replacing its parameter segments with matchers for parameter values
    const { wheres = {} } = this.rawRoute
    const pattern = route.getTemplate(location)
      .replace(/(\/?){([^}?]*)(\??)}/g, (_, slash, segment, optional) => {
        const regex = `(?<${segment}>${
          wheres[segment]?.replace(/(^\^)|(\$$)/g, '') || '[^/?]+'
        })`
        return optional ? `(${slash}${regex})?` : `${slash}${regex}`
      })
      .replace(/^\w+:\/\//, '')

    const [path, query] = url.replace(/^\w+:\/\//, '').split('?')

    const matches = new RegExp(`^${pattern}/?$`).exec(path)

    if (!matches) {
      return false
    }

    return { params: matches.groups, query: parse(query) }*/
  }
}
