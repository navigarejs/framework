/**
 * @vitest-environment jsdom
 */

import { expect, it } from 'vitest'
import {
  PartialRoute,
  RawRoute,
  Route,
  RouteParameters,
  Wildcard,
} from '../src'
import createRoute from '../src/createRoute'

const rawRoutes: Record<string, RawRoute> = {
  home: {
    uri: '/',
    methods: ['GET', 'HEAD'],
    name: 'home' as never,
    method: 'GET',
  },
  'posts.index': {
    uri: 'posts',
    methods: ['GET', 'HEAD'],
    name: 'posts.index' as never,
    method: 'GET',
  },
  'posts.show': {
    uri: 'posts/{post}',
    methods: ['GET', 'HEAD'],
    bindings: {
      post: 'id',
    },
    name: 'posts.show' as never,
    method: 'GET',
  },
}

it('returns a Route instance', () => {
  expect(createRoute(rawRoutes['posts.index'] as never)).toBeInstanceOf(Route)
})

it('returns a PartialRoute instance', () => {
  expect(
    createRoute(
      rawRoutes['posts.show'] as never,
      ({ Wildcard }) =>
        ({
          post: Wildcard,
        } as RouteParameters<never>),
    ),
  ).toBeInstanceOf(PartialRoute)

  expect(
    createRoute(
      rawRoutes['posts.show'] as never,
      {
        post: Wildcard,
      } as RouteParameters<never>,
    ),
  ).toBeInstanceOf(PartialRoute)
})
