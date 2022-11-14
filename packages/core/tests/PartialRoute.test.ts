import { PartialRoute, RawRoute, Route, Wildcard } from '../src'
import { describe, expect, it } from 'vitest'

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

describe('matches other routes', () => {
  it('by string', () => {
    expect(
      new PartialRoute(rawRoutes['posts.show'] as never, {
        post: Wildcard,
      }).match('posts.*'),
    ).toEqual(true)

    expect(
      new PartialRoute(rawRoutes['posts.show'] as never, {
        post: 1,
      }).match('no-posts.*'),
    ).toEqual(false)
  })

  it('by Route', () => {
    const route = new PartialRoute(rawRoutes['posts.show'] as never, {
      post: Wildcard,
    })

    expect(route.match(route)).toEqual(true)

    expect(
      route.match(
        new Route(rawRoutes['posts.show'] as never, {
          post: 1,
          section: 'details',
        }),
      ),
    ).toEqual(true)

    expect(
      route.match(
        new Route(rawRoutes['posts.show'] as never, {
          post: 2,
        }),
      ),
    ).toEqual(true)

    expect(
      route.match(new Route(rawRoutes['posts.index'] as never, {})),
    ).toEqual(false)
  })

  it('by PartialRoute', () => {
    const route = new PartialRoute(rawRoutes['posts.show'] as never, {
      post: Wildcard,
    })

    expect(
      route.match(
        new PartialRoute(rawRoutes['posts.show'] as never, {
          post: Wildcard,
        }),
      ),
    ).toEqual(true)
  })
})
