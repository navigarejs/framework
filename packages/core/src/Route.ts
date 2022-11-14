import PartialRoute from './PartialRoute'
import {
  RouteParameters,
  RawRoute,
  RouteName,
  RouterLocation,
  RawRouteParameters,
  RouteDefaults,
  QueryStringArrayFormat,
} from './types'
import { throwError } from './utilities'
import get from 'lodash.get'
import isBoolean from 'lodash.isboolean'
import { stringify } from 'qs'

export default class Route<
  TName extends RouteName = RouteName,
> extends PartialRoute<TName> {
  public partial = false

  public absolute: boolean

  public constructor(
    rawRoute: RawRoute,
    parameters: RawRouteParameters<TName>,
    absolute = false,
  ) {
    super(rawRoute, parameters)

    this.absolute = absolute
  }

  /**
   * Get the compiled URL string for the current route and parameters.
   */
  public getHref(
    location: RouterLocation,
    defaults: RouteDefaults = {},
    options: {
      queryStringArrayFormat?: QueryStringArrayFormat
    } = {},
  ): string {
    // Get parameters that don't correspond to any route segments to append them to the query
    const parameters = this.getParameters(defaults)
    const query = this.getQueryParameters(location, defaults, this.absolute)

    return [
      this.compile(location, parameters),
      stringify(
        { ...query, ...get(this.parameters, '_query') },
        {
          addQueryPrefix: true,
          arrayFormat: options.queryStringArrayFormat,
          encodeValuesOnly: true,
          skipNulls: true,
          encoder: (value, encoder) => {
            if (isBoolean(value)) {
              return String(Number(value))
            }

            return encoder(value)
          },
        },
      ),
    ].join('')
  }

  /**
   * Get the compiled URL string for the current route and parameters.
   */
  public getUrl(
    location: RouterLocation,
    defaults: RouteDefaults = {},
    options: {
      queryStringArrayFormat?: QueryStringArrayFormat
    } = {},
  ): URL {
    return new URL(this.getHref(location, defaults, options), location.href)
  }

  /**
   * Hydrate and return a complete URL for this route with the given parameters.
   */
  compile(
    location: RouterLocation,
    parameters: RouteParameters<TName>,
  ): string {
    const segments = this.getParameterSegments(location, this.absolute)
    const { wheres = {} } = this.rawRoute
    const template = this.getTemplate(location, this.absolute)

    if (!segments.length) {
      return template
    }

    return template
      .replace(
        /{([^}?]+)(\??)}/g,
        (_, segment: string, optional: string | null) => {
          // If the parameter is missing but is not optional, throw an error
          if (
            !optional &&
            (typeof get(parameters, segment) === 'undefined' ||
              get(parameters, segment) === null)
          ) {
            throwError(
              `"${segment}" parameter is required for route "${this.name}"`,
            )
          }

          const parameter = String(get(parameters, segment, ''))

          if (
            segments[segments.length - 1].name === segment &&
            wheres[segment] === '.*'
          ) {
            return encodeURIComponent(parameter.replace(/%2F/g, '/'))
          }

          if (
            wheres[segment] &&
            !new RegExp(
              `^${optional ? `(${wheres[segment]})?` : wheres[segment]}$`,
            ).test(parameter)
          ) {
            throwError(
              `"${segment}" parameter does not match required format "${wheres[segment]}" for route "${this.name}"`,
            )
          }

          return encodeURIComponent(parameter ?? '')
        },
      )
      .replace(/\/+$/, '')
  }
}
