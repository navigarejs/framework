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
import { throwError, getKeys } from './utilities'
import get from 'lodash.get'
import isBoolean from 'lodash.isboolean'
import { stringify } from 'qs'

export default class Route<
  TName extends RouteName,
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
    const unhandled = getKeys(this.parameters)
      .filter(
        (key) =>
          !this.getParameterSegments(location).some(({ name }) => name === key),
      )
      .filter((key) => key !== '_query')
      .reduce(
        (result, key) => ({
          ...result,
          [key]: this.parameters[key],
        }),
        {},
      )

    return [
      this.compile(location, parameters),
      stringify(
        { ...unhandled, ...get(this.parameters, '_query') },
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
  public getUrl(location: RouterLocation): URL {
    return new URL(this.getHref(location), location.href)
  }

  /**
   * Get a 'template' of the complete URL for this route.
   *
   * @example
   * https://{user}.github.io/{repository}
   */
  getTemplate(location: RouterLocation): string {
    // If we're building just a path there's no origin, otherwise: if this route has a
    // domain configured we construct the origin with that, if not we use the app URL
    const origin = this.rawRoute.domain
      ? `${location.protocol}://${this.rawRoute.domain}${
          location.port ? `:${location.port}` : ''
        }`
      : this.absolute
      ? location.origin
      : ''

    return `${origin}/${this.rawRoute.uri}`.replace(/\/+$/, '')
  }

  /**
   * Get an array of objects representing the parameters that this route accepts.
   *
   * @example
   * [{ name: 'team', required: true }, { name: 'user', required: false }]
   */
  getParameterSegments(location: RouterLocation) {
    const template = this.getTemplate(location)

    return (
      template.match(/{[^}?]+\??}/g)?.map((segment) => ({
        name: segment.replace(/{|\??}/g, ''),
        required: !/\?}$/.test(segment),
      })) ?? []
    )
  }

  /**
   * Get whether this route's template matches the given URL.
   */
  /*matches(location: RouterLocation, url: string) {
    if (!this.rawRoute.methods.includes('GET')) {
      return false
    }

    // Transform the route's template into a regex that will match a hydrated URL,
    // by replacing its parameter segments with matchers for parameter values
    const { wheres = {} } = this.rawRoute
    const pattern = this.getTemplate(location)
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

    return { params: matches.groups, query: parse(query) }
  }*/

  /**
   * Hydrate and return a complete URL for this route with the given parameters.
   */
  compile(
    location: RouterLocation,
    parameters: RouteParameters<TName>,
  ): string {
    const segments = this.getParameterSegments(location)
    const { wheres = {} } = this.rawRoute
    const template = this.getTemplate(location)

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
