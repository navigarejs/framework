import PartialRoute from './PartialRoute'
import Route from './Route'
import { Default, Wildcard } from './symbols'
import { RawRoute, RawRouteParameters, RouteName, RouteOptions } from './types'
import { isFunction } from './utilities'
import { ConditionalPick } from 'type-fest'

export default function createRoute<
  TName extends RouteName,
  TRawRoute extends RawRoute<TName>,
  TParameters extends RawRouteParameters<TName>,
  TKeys = keyof TParameters,
  TEmpty extends boolean = TKeys extends [never] ? true : false,
  TPartial extends boolean = [
    keyof ConditionalPick<TParameters, typeof Wildcard>,
  ] extends [never]
    ? false
    : true,
>(
  rawRoute: TName | TRawRoute,
  ...args: TEmpty extends true
    ? [
        (
          | TParameters
          | ((context: {
              Wildcard: typeof Wildcard
              Default: typeof Default
            }) => TParameters)
        )?,
        RouteOptions?,
      ]
    : [
        (
          | TParameters
          | ((context: {
              Wildcard: typeof Wildcard
              Default: typeof Default
            }) => TParameters)
        ),
        RouteOptions?,
      ]
): TPartial extends true ? PartialRoute<TName> : Route<TName> {
  const [getParameters = () => ({}), options = {}] = args
  const parameters = isFunction(getParameters)
    ? getParameters({
        Wildcard,
        Default,
      })
    : getParameters
  const partial = Object.values(parameters).includes(Wildcard)

  if (partial) {
    return new PartialRoute<TName>(
      rawRoute,
      parameters,
      options,
    ) as TPartial extends true ? PartialRoute<TName> : Route<TName>
  }

  return new Route<TName>(
    rawRoute,
    parameters,
    options,
  ) as TPartial extends true ? PartialRoute<TName> : Route<TName>
}
