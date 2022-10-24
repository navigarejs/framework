import isObject from 'lodash.isobject'
import {
  RouteMethod,
  RouteParameters,
  RawRoute,
  RouteName,
  RawRouteParameters,
  RouteDefaults,
  Routable,
} from './types'
import { getKeys, isNotNull, mapRouteMethod, throwError } from './utilities'
import isBoolean from 'lodash.isboolean'
import isSymbol from 'lodash.issymbol'
import get from 'lodash.get'
import { Default, Wildcard } from './symbols'
import isString from 'lodash.isstring'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default class PartialRoute<TName extends RouteName> {
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
                    `object passed as "${key}" parameter is missing route model binding key "${binding}"`,
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
   * Check if the route matches the given route
   */
  public matches(
    comparableRoute: Routable | PartialRoute<RouteName>,
    defaults: RouteDefaults = {},
  ): boolean {
    // Test the passed name against the route, matching some
    // basic wildcards, e.g. passing `events.*` matches `events.show`
    if (isString(comparableRoute)) {
      const match = new RegExp(
        `^${comparableRoute.replace(/\./g, '\\.').replace(/\*/g, '.*')}$`,
      ).test(this.name)

      return match
    }

    // Checking an URL against this route
    if (comparableRoute instanceof URL) {
      throwError('passing an URL to "matches" is not yet supported')
    }

    // Now we deal with Route instances
    if (this.rawRoute.name !== comparableRoute.name) {
      return false
    }

    const parameters = this.getParameters(defaults)
    const comparableParameters = comparableRoute.getParameters()
    const comparableRawParameters = comparableRoute.parameters

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
      const value = get(comparableParameters, key)
      return String(parameters[key]) === String(value)
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
