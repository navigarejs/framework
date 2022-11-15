/**
 * @vitest-environment jsdom
 */
import {
  Default,
  PartialRoute,
  RawRoute,
  Route,
  RouterLocation,
  Wildcard,
} from '../src'
import { describe, expect, it } from 'vitest'

const location: RouterLocation = {
  href: 'https://navigare.test:1337/',
  host: 'navigare.test:1337',
  hostname: 'navigare.test',
  origin: 'https://navigare.test:1337',
  pathname: '',
  port: '1337',
  protocol: 'https:',
  search: '',
  hash: '',
  state: undefined,
}

const defaults = { locale: 'en' }

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
  'posts.update': {
    uri: 'posts/{post}',
    methods: ['PUT'],
    bindings: {
      post: 'id',
    },
    name: 'posts.update' as never,
    method: 'PUT',
  },
  'postComments.show': {
    uri: 'posts/{post}/comments/{comment}',
    methods: ['GET', 'HEAD'],
    bindings: {
      post: 'id',
      comment: 'uuid',
    },
    name: 'postComments.show' as never,
    method: 'GET',
  },
  'translatePosts.index': {
    uri: '{locale}/posts',
    methods: ['GET', 'HEAD'],
    name: 'translatePosts.index' as never,
    method: 'GET',
  },
  'translatePosts.show': {
    uri: '{locale}/posts/{id}',
    methods: ['GET', 'HEAD'],
    name: 'translatePosts.show' as never,
    method: 'GET',
  },
  'translatePosts.update': {
    uri: '{locale}/posts/{post}',
    methods: ['PUT', 'PATCH'],
    name: 'translatePosts.update' as never,
    method: 'PUT',
  },
  'events.venues-index': {
    uri: 'events/{event}/venues-index',
    methods: ['GET', 'HEAD'],
    bindings: {
      event: 'id',
    },
    name: 'events.venues-index' as never,
    method: 'GET',
  },
  'events.venues.index': {
    uri: 'events/{event}/venues',
    methods: ['GET', 'HEAD'],
    bindings: {
      event: 'id',
    },
    name: 'events.venues.index' as never,
    method: 'GET',
  },
  'events.venues.show': {
    uri: 'events/{event}/venues/{venue}',
    methods: ['GET', 'HEAD'],
    bindings: {
      event: 'id',
      venue: 'id',
    },
    name: 'events.venues.show' as never,
    method: 'GET',
  },
  'events.venues.update': {
    uri: 'events/{event}/venues/{venue}',
    methods: ['PUT', 'PATCH'],
    name: 'events.venues.update' as never,
    method: 'PUT',
  },
  'translateEvents.venues.show': {
    uri: '{locale}/events/{event}/venues/{venue}',
    methods: ['GET', 'HEAD'],
    bindings: {
      event: 'id',
      venue: 'id',
    },
    name: 'translateEvents.venues.show' as never,
    method: 'GET',
  },
  'conversations.show': {
    uri: 'subscribers/{subscriber}/conversations/{type}/{conversation_id?}',
    methods: ['GET', 'HEAD'],
    name: 'conversations.show' as never,
    method: 'GET',
  },
  optional: {
    uri: 'optional/{id}/{slug?}',
    methods: ['GET', 'HEAD'],
    name: 'optional' as never,
    method: 'GET',
  },
  optionalId: {
    uri: 'optionalId/{type}/{id?}',
    methods: ['GET', 'HEAD'],
    name: 'optionalId' as never,
    method: 'GET',
  },
  'team.user.show': {
    uri: 'users/{id}',
    methods: ['GET', 'HEAD'],
    domain: '{team}.navigare.test',
    name: 'team.user.show' as never,
    method: 'GET',
  },
  'translateTeam.user.show': {
    uri: '{locale}/users/{id}',
    methods: ['GET', 'HEAD'],
    domain: '{team}.navigare.test',
    name: 'translateTeam.user.show' as never,
    method: 'GET',
  },
  'products.show': {
    uri: '{country?}/{language?}/products/{id}',
    methods: ['GET', 'HEAD'],
    name: 'products.show' as never,
    method: 'GET',
  },
  'hosting-contacts.index': {
    uri: 'hosting-contacts',
    methods: ['GET', 'HEAD'],
    name: 'hosting-contacts.index' as never,
    method: 'GET',
  },
  'pages.optional': {
    uri: 'optionalpage/{page?}',
    methods: ['GET', 'HEAD'],
    name: 'pages.optional' as never,
    method: 'GET',
  },
  'pages.optionalExtension': {
    uri: 'download/file{extension?}',
    methods: ['GET', 'HEAD'],
    name: 'pages.optionalExtension' as never,
    method: 'GET',
  },
  'pages.requiredExtension': {
    uri: 'strict-download/file{extension}',
    methods: ['GET', 'HEAD'],
    name: 'pages.requiredExtension' as never,
    method: 'GET',
  },
  'pages.optionalWhere': {
    uri: 'where/optionalpage/{page?}',
    methods: ['GET', 'HEAD'],
    wheres: {
      page: '[0-9]+',
    },
    name: 'pages.optionalWhere' as never,
    method: 'GET',
  },
  'pages.optionalExtensionWhere': {
    uri: 'where/download/file{extension?}',
    methods: ['GET', 'HEAD'],
    wheres: {
      extension: '\\.(php|html)',
    },
    name: 'pages.optionalExtensionWhere' as never,
    method: 'GET',
  },
  'pages.requiredExtensionWhere': {
    uri: 'where/strict-download/file{extension}',
    methods: ['GET', 'HEAD'],
    wheres: {
      extension: '\\.(php|html)',
    },
    name: 'pages.requiredExtensionWhere' as never,
    method: 'GET',
  },
  'pages.complexWhere': {
    uri: 'where/{word}-{digit}/{required}/{optional?}/file{extension?}',
    methods: ['GET', 'HEAD'],
    wheres: {
      word: '[a-z_-]+',
      digit: '[0-9]+',
      required: 'required',
      optional: 'optional',
      extension: '\\.(php|html)',
    },
    name: 'pages.complexWhere' as never,
    method: 'GET',
  },
  'pages.complexWhereConflict1': {
    uri: 'where/{digit}-{word}/{required}/{optional?}/file{extension?}',
    methods: ['GET', 'HEAD'],
    wheres: {
      word: '[a-z_-]+',
      digit: '[0-9]+',
      required: 'required',
      optional: 'optional',
      extension: '\\.(php|html)',
    },
    name: 'pages.complexWhereConflict1' as never,
    method: 'GET',
  },
  'pages.complexWhereConflict2': {
    uri: 'where/complex-{digit}/{required}/{optional?}/file{extension?}',
    methods: ['GET', 'HEAD'],
    wheres: {
      digit: '[0-9]+',
      required: 'different_but_required',
      optional: 'optional',
      extension: '\\.(php|html)',
    },
    name: 'pages.complexWhereConflict2' as never,
    method: 'GET',
  },
  pages: {
    uri: '{page}',
    methods: ['GET', 'HEAD'],
    name: 'pages' as never,
    method: 'GET',
  },
  slashes: {
    uri: 'slashes/{encoded}/{slug}',
    methods: ['GET', 'HEAD'],
    wheres: {
      slug: '.*',
    },
    name: 'slashes' as never,
    method: 'GET',
  },
}

it('can generate a URL with no parameters', () => {
  expect(
    new Route(rawRoutes['posts.index'] as never, {}).getHref(
      location,
      defaults,
    ),
  ).toEqual('/posts')

  expect(
    new Route(rawRoutes['posts.index'] as never, {}, true).getHref(
      location,
      defaults,
    ),
  ).toEqual('https://navigare.test:1337/posts')
})

it('can generate a URL with default parameters', () => {
  expect(
    new Route(rawRoutes['translatePosts.index'] as never, {
      locale: Default,
    }).getHref(location, defaults),
  ).toEqual('/en/posts')

  expect(
    new Route(
      rawRoutes['translatePosts.index'] as never,
      {
        locale: Default,
      },
      true,
    ).getHref(location, defaults),
  ).toEqual('https://navigare.test:1337/en/posts')
})

it('can generate a URL with filled optional parameters', () => {
  expect(
    new Route(rawRoutes['conversations.show'] as never, {
      type: 'email',
      subscriber: 123,
      conversation_id: 1234,
    }).getHref(location, defaults),
  ).toEqual('/subscribers/123/conversations/email/1234')

  expect(
    new Route(
      rawRoutes['conversations.show'] as never,
      {
        type: 'email',
        subscriber: 123,
        conversation_id: 1234,
      },
      true,
    ).getHref(location, defaults),
  ).toEqual(
    'https://navigare.test:1337/subscribers/123/conversations/email/1234',
  )
})

it('can error if a required parameter is not provided', () => {
  expect(() =>
    new Route(rawRoutes['posts.show'] as never, {}).getHref(location, defaults),
  ).toThrow(/"post" parameter is required/)
})

it('can generate a URL using an integer', () => {
  // route with required parameters
  expect(
    new Route(rawRoutes['posts.show'] as never, {
      post: 1,
    }).getHref(location, defaults),
  ).toEqual('/posts/1')

  // route with default parameters
  expect(
    new Route(rawRoutes['translatePosts.show'] as never, {
      locale: Default,
      id: 1,
    }).getHref(location, defaults),
  ).toEqual('/en/posts/1')
})

it('can generate a URL for a route with domain parameters', () => {
  // route with required domain parameters
  expect(
    new Route(rawRoutes['team.user.show'] as never, {
      team: 'jaulz',
      id: 1,
    }).getHref(location, defaults),
  ).toEqual('https://jaulz.navigare.test:1337/users/1')

  // route with required domain parameters and default parameters
  expect(
    new Route(rawRoutes['translateTeam.user.show'] as never, {
      team: 'jaulz',
      id: 1,
      locale: Default,
    }).getHref(location, defaults),
  ).toEqual('https://jaulz.navigare.test:1337/en/users/1')
})

it('can generate a URL for a route with a custom route model binding scope', () => {
  expect(
    new Route(rawRoutes['postComments.show'] as never, {
      post: { id: 1, title: 'Post' },
      comment: { uuid: 12345, title: 'Comment' },
    }).getHref(location, defaults),
  ).toEqual('/posts/1/comments/12345')

  expect(
    new Route(rawRoutes['postComments.show'] as never, {
      post: { id: 1, title: 'Post' },
      comment: { uuid: 'correct-horse-etc-etc' },
    }).getHref(location, defaults),
  ).toEqual('/posts/1/comments/correct-horse-etc-etc')
})

it('can generate a URL for an app installed in a subfolder', () => {
  expect(
    new Route(rawRoutes['postComments.show'] as never, {
      post: 1,
      comment: { uuid: 'correct-horse-etc-etc' },
    }).getHref(
      {
        ...location,
        href: `${location.href}/subfolder`,
        pathname: 'subfolder',
      },
      defaults,
    ),
    '/subfolder/posts/1/comments/correct-horse-etc-etc',
  )
})

it('can error if a route model binding key is missing', () => {
  expect(() =>
    new Route(rawRoutes['postComments.show'] as never, {
      post: 1,
      comment: { count: 20 },
    }).getHref(location, defaults),
  ).toThrow(
    /an object was passed to parameter "comment" but it is missing the property "uuid"/,
  )
})

it('can return base URL if path is "/"', () => {
  expect(
    new Route(rawRoutes['home'] as never, {}).getHref(location, defaults),
  ).toEqual('/')

  expect(
    new Route(rawRoutes['home'] as never, {}, true).getHref(location, defaults),
  ).toEqual('https://navigare.test:1337')
})

it('can ignore an optional parameter', () => {
  expect(
    new Route(rawRoutes['optional'] as never, { id: 123 }).getHref(
      location,
      defaults,
    ),
  ).toEqual('/optional/123')

  expect(
    new Route(rawRoutes['optional'] as never, {
      id: 123,
      slug: 'news',
    }).getHref(location, defaults),
  ).toEqual('/optional/123/news')

  expect(
    new Route(rawRoutes['optional'] as never, { id: 123, slug: null }).getHref(
      location,
      defaults,
    ),
  ).toEqual('/optional/123')
})

it('can ignore a single optional parameter', () => {
  expect(
    new Route(rawRoutes['pages.optional'] as never, {}).getHref(
      location,
      defaults,
    ),
  ).toEqual('/optionalpage')

  expect(
    new Route(rawRoutes['pages.optional'] as never, {}).getHref(
      location,
      defaults,
    ),
  ).toEqual('/optionalpage')
})

it('can error if a route name doesn’t exist', () => {
  expect(() => new Route('unknown-route' as never, {})).toThrow(
    /"unknown-route" is not a valid route/,
  )
})

it('can automatically append extra parameter values as a query string', () => {
  expect(
    new Route(rawRoutes['events.venues.show'] as never, {
      event: 1,
      venue: 2,
      search: 'rogers',
      page: 2,
    }).getHref(location, defaults),
  ).toEqual('/events/1/venues/2?search=rogers&page=2')

  expect(
    new Route(rawRoutes['events.venues.show'] as never, {
      id: 2,
      event: 1,
      venue: 2,
      search: 'rogers',
    }).getHref(location, defaults),
  ).toEqual('/events/1/venues/2?id=2&search=rogers')

  // ignore values explicitly set to `null`
  expect(
    new Route(rawRoutes['posts.index'] as never, {
      filled: 'filling',
      empty: null,
    }).getHref(location, defaults),
  ).toEqual('/posts?filled=filling')
})

it('can cast boolean query parameters to integers', () => {
  expect(
    new Route(rawRoutes['posts.show'] as never, {
      post: 1,
      preview: true,
    }).getHref(location, defaults),
  ).toEqual('/posts/1?preview=1')
})

it('can explicitly append query parameters using _query parameter', () => {
  expect(
    new Route(rawRoutes['events.venues.show'] as never, {
      event: 1,
      venue: 2,
      _query: {
        event: 4,
        venue: 2,
      },
    }).getHref(location, defaults),
  ).toEqual('/events/1/venues/2?event=4&venue=2')

  expect(
    new Route(rawRoutes['events.venues.show'] as never, {
      event: { id: 4, name: 'Fun Event' },
      _query: {
        event: 9,
        id: 12,
      },
      venue: 2,
    }).getHref(location, defaults),
  ).toEqual('/events/4/venues/2?event=9&id=12')
})

it('can generate a URL with a port', () => {
  // route with no parameters
  expect(
    new Route(rawRoutes['posts.index'] as never, {}).getHref(
      {
        ...location,
        href: 'https://test.thing:81/ab/cd/',
        port: '81',
      },
      defaults,
    ),
  ).toEqual('/posts')

  // route with required domain parameters
  expect(
    new Route(rawRoutes['team.user.show'] as never, {
      team: 'jaulz',
      id: 1,
    }).getHref(
      {
        ...location,
        href: 'https://test.thing:81/ab/cd/',
        port: '81',
      },
      defaults,
    ),
  ).toEqual('https://jaulz.navigare.test:81/users/1')
})

it('can handle trailing path segments in the base URL', () => {
  expect(
    new Route(rawRoutes['events.venues.index'] as never, {
      event: 1,
    }).getHref(
      {
        ...location,
        href: 'https://test.thing:1337/ab/cd/',
        pathname: 'ab/cd/',
      },
      defaults,
    ),
  ).toEqual('/events/1/venues')
})

it('can URL-encode named parameters', () => {
  expect(
    new Route(rawRoutes['events.venues.index'] as never, {
      event: 'Fun&Games',
    }).getHref(
      {
        ...location,
        href: 'https://test.thing:1337/ab/cd/',
        pathname: 'ab/cd/',
      },
      defaults,
    ),
  ).toEqual('/events/Fun%26Games/venues')

  expect(
    new Route(rawRoutes['events.venues.index'] as never, {
      event: 'Fun&Games',
      location: 'Blues&Clues',
    }).getHref(
      {
        ...location,
        href: 'https://test.thing:1337/ab/cd/',
        pathname: 'ab/cd/',
      },
      defaults,
    ),
  ).toEqual('/events/Fun%26Games/venues?location=Blues%26Clues')
})

it('can format an array of query parameters', () => {
  expect(
    new Route(rawRoutes['events.venues.index'] as never, {
      event: 'test',
      guests: ['a', 'b', 'c'],
    }).getHref(location, defaults),
  ).toEqual('/events/test/venues?guests[0]=a&guests[1]=b&guests[2]=c')
})

it('can handle a parameter explicity set to `0`', () => {
  expect(
    new Route(rawRoutes['posts.update'] as never, {
      post: 0,
    }).getHref(location, defaults),
  ).toEqual('/posts/0')
})

describe('matches other routes', () => {
  it('by string', () => {
    expect(
      new Route(rawRoutes['posts.show'] as never, {
        post: 1,
      }).match('posts.*', location),
    ).toEqual(true)

    expect(
      new Route(rawRoutes['posts.show'] as never, {
        post: 1,
        comments: false,
      }).match('posts.*', location),
    ).toEqual(true)

    expect(
      new Route(rawRoutes['posts.show'] as never, {
        post: 1,
      }).match('no-posts.*', location),
    ).toEqual(false)
  })

  it('by URL', () => {
    expect(
      new Route(rawRoutes['posts.show'] as never, {
        post: 1,
      }).match(new URL('https://navigare.test:1337/posts/5'), location),
    ).toEqual(true)

    expect(
      new Route(rawRoutes['posts.show'] as never, {
        post: 1,
      }).match(
        new URL('https://navigare.test:1337/posts/5?comments=true'),
        location,
      ),
    ).toEqual(false)

    expect(
      new Route(rawRoutes['posts.show'] as never, {
        post: 1,
        comments: false,
      }).match(
        new URL('https://navigare.test:1337/posts/5?comments=true'),
        location,
      ),
    ).toEqual(false)

    expect(
      new Route(rawRoutes['posts.show'] as never, {
        post: 1,
      }).match(new URL('https://navigare.test:1337/test'), location),
    ).toEqual(false)
  })

  it('by Route', () => {
    const route = new Route(rawRoutes['posts.show'] as never, {
      post: 1,
    })

    expect(route.match(route, location)).toEqual(true)

    expect(
      route.match(
        new Route(rawRoutes['posts.show'] as never, {
          post: 1,
          section: 'details',
        }),
        location,
      ),
    ).toEqual(true)

    expect(
      route.match(
        new Route(rawRoutes['posts.show'] as never, {
          post: 2,
        }),
        location,
      ),
    ).toEqual(false)

    expect(
      route.match(new Route(rawRoutes['posts.index'] as never, {}), location),
    ).toEqual(false)
  })

  it('by PartialRoute', () => {
    const route = new Route(rawRoutes['posts.show'] as never, {
      post: 1,
    })

    expect(
      route.match(
        new PartialRoute(rawRoutes['posts.show'] as never, {
          post: Wildcard,
        }),
        location,
      ),
    ).toEqual(true)
  })
})
