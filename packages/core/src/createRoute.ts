import PartialRoute from './PartialRoute'
import Route from './Route'
import { Default, Wildcard } from './symbols'
import { RawRoute, RawRouteParameters, RouteName } from './types'
import isFunction from 'lodash.isfunction'
import { ConditionalPick } from 'type-fest'
import type { IsEmptyObject } from 'type-fest'

export default function createRoute<
  TName extends RouteName,
  TRawRoute extends RawRoute<TName>,
  TParameters extends RawRouteParameters<TName>,
  TPartial extends boolean = keyof ConditionalPick<
    TParameters,
    typeof Wildcard
  > extends never
    ? false
    : true,
>(
  rawRoute: TName | TRawRoute,
  ...args: IsEmptyObject<TParameters> extends true
    ? [
        (
          | TParameters
          | ((context: {
              Wildcard: typeof Wildcard
              Default: typeof Default
            }) => TParameters)
        )?,
        boolean?,
      ]
    : [
        (
          | TParameters
          | ((context: {
              Wildcard: typeof Wildcard
              Default: typeof Default
            }) => TParameters)
        ),
        boolean?,
      ]
): TPartial extends true ? PartialRoute<TName> : Route<TName> {
  const [getParameters = () => ({}), absolute = false] = args
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
    ) as TPartial extends true ? PartialRoute<TName> : Route<TName>
  }

  return new Route<TName>(
    rawRoute,
    parameters,
    absolute,
  ) as TPartial extends true ? PartialRoute<TName> : Route<TName>
}
