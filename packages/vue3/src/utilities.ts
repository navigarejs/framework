import {
  PartialRoute,
  Routable,
  castArray,
  isArray,
  isFunction,
  isObject,
} from '@navigare/core'
import { PropType, Slot, VNode } from 'vue'

type RouteName = keyof import('@navigare/core').Routes

function getVNodesText(children: VNode[]): string {
  return children
    .map((node) => {
      if (!node.children || typeof node.children === 'string') {
        return node.children || ''
      } else if (isArray(node.children)) {
        return getVNodesText(node.children as VNode[])
      } else if (isObject(node.children) && isFunction(node.children.default)) {
        return getVNodesText(node.children.default())
      }
    })
    .join('')
    .trim()
}

export function getVNodeText(
  vnode: VNode | VNode[] | Slot | undefined,
): string {
  if (!vnode) {
    return ''
  }

  return getVNodesText(isFunction(vnode) ? vnode() : castArray(vnode))
}

export function getRouteType(): PropType<
  | Routable<RouteName>
  | [Routable<RouteName>, ...(PartialRoute<RouteName> | string)[]]
> {
  return [String, Object, Array] as any
}

export function getRouteProp() {
  return {
    type: getRouteType(),
  }
}

export function ensureFunction(
  maybeFunction: unknown,
): ((...args: unknown[]) => any) | undefined {
  if (!isFunction(maybeFunction)) {
    return undefined
  }

  return maybeFunction
}
