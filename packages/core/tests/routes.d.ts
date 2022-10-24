import '@navigare/core'

declare module '@navigare/core' {
  export interface Routes {
    home: {
      uri: '/'
      methods: ['GET', 'HEAD']
      name: 'home'
      method: 'GET'
    }
    'posts.index': {
      uri: 'posts'
      methods: ['GET', 'HEAD']
      name: 'posts.index'
      method: 'GET'
    }
    'posts.show': {
      uri: 'posts/{post}'
      methods: ['GET', 'HEAD']
      bindings: {
        post: 'id'
      }
      name: 'posts.show'
      method: 'GET'
    }
    'posts.update': {
      uri: 'posts/{post}'
      methods: ['PUT']
      bindings: {
        post: 'id'
      }
      name: 'posts.update'
      method: 'PUT'
    }
    'postComments.show': {
      uri: 'posts/{post}/comments/{comment}'
      methods: ['GET', 'HEAD']
      bindings: {
        post: 'id'
        comment: 'uuid'
      }
      name: 'postComments.show'
      method: 'GET'
    }
    'translatePosts.index': {
      uri: '{locale}/posts'
      methods: ['GET', 'HEAD']
      name: 'translatePosts.index'
      method: 'GET'
    }
    'translatePosts.show': {
      uri: '{locale}/posts/{id}'
      methods: ['GET', 'HEAD']
      name: 'translatePosts.show'
      method: 'GET'
    }
    'translatePosts.update': {
      uri: '{locale}/posts/{post}'
      methods: ['PUT', 'PATCH']
      name: 'translatePosts.update'
      method: 'PUT'
    }
    'events.venues-index': {
      uri: 'events/{event}/venues-index'
      methods: ['GET', 'HEAD']
      bindings: {
        event: 'id'
      }
      name: 'events.venues-index'
      method: 'GET'
    }
    'events.venues.index': {
      uri: 'events/{event}/venues'
      methods: ['GET', 'HEAD']
      bindings: {
        event: 'id'
      }
      name: 'events.venues.index'
      method: 'GET'
    }
    'events.venues.show': {
      uri: 'events/{event}/venues/{venue}'
      methods: ['GET', 'HEAD']
      bindings: {
        event: 'id'
        venue: 'id'
      }
      name: 'events.venues.show'
      method: 'GET'
    }
    'events.venues.update': {
      uri: 'events/{event}/venues/{venue}'
      methods: ['PUT', 'PATCH']
      name: 'events.venues.update'
      method: 'PUT'
    }
    'translateEvents.venues.show': {
      uri: '{locale}/events/{event}/venues/{venue}'
      methods: ['GET', 'HEAD']
      bindings: {
        event: 'id'
        venue: 'id'
      }
      name: 'translateEvents.venues.show'
      method: 'GET'
    }
    'conversations.show': {
      uri: 'subscribers/{subscriber}/conversations/{type}/{conversation_id?}'
      methods: ['GET', 'HEAD']
      name: 'conversations.show'
      method: 'GET'
    }
    optional: {
      uri: 'optional/{id}/{slug?}'
      methods: ['GET', 'HEAD']
      name: 'optional'
      method: 'GET'
    }
    optionalId: {
      uri: 'optionalId/{type}/{id?}'
      methods: ['GET', 'HEAD']
      name: 'optionalId'
      method: 'GET'
    }
    'team.user.show': {
      uri: 'users/{id}'
      methods: ['GET', 'HEAD']
      domain: '{team}.jaulz.github.io/navigare'
      name: 'team.user.show'
      method: 'GET'
    }
    'translateTeam.user.show': {
      uri: '{locale}/users/{id}'
      methods: ['GET', 'HEAD']
      domain: '{team}.jaulz.github.io/navigare'
      name: 'translateTeam.user.show'
      method: 'GET'
    }
    'products.show': {
      uri: '{country?}/{language?}/products/{id}'
      methods: ['GET', 'HEAD']
      name: 'products.show'
      method: 'GET'
    }
    'hosting-contacts.index': {
      uri: 'hosting-contacts'
      methods: ['GET', 'HEAD']
      name: 'hosting-contacts.index'
      method: 'GET'
    }
    'pages.optional': {
      uri: 'optionalpage/{page?}'
      methods: ['GET', 'HEAD']
      name: 'pages.optional'
      method: 'GET'
    }
    'pages.optionalExtension': {
      uri: 'download/file{extension?}'
      methods: ['GET', 'HEAD']
      name: 'pages.optionalExtension'
      method: 'GET'
    }
    'pages.requiredExtension': {
      uri: 'strict-download/file{extension}'
      methods: ['GET', 'HEAD']
      name: 'pages.requiredExtension'
      method: 'GET'
    }
    'pages.optionalWhere': {
      uri: 'where/optionalpage/{page?}'
      methods: ['GET', 'HEAD']
      wheres: {
        page: '[0-9]+'
      }
      name: 'pages.optionalWhere'
      method: 'GET'
    }
    'pages.optionalExtensionWhere': {
      uri: 'where/download/file{extension?}'
      methods: ['GET', 'HEAD']
      wheres: {
        extension: '\\.(php|html)'
      }
      name: 'pages.optionalExtensionWhere'
      method: 'GET'
    }
    'pages.requiredExtensionWhere': {
      uri: 'where/strict-download/file{extension}'
      methods: ['GET', 'HEAD']
      wheres: {
        extension: '\\.(php|html)'
      }
      name: 'pages.requiredExtensionWhere'
      method: 'GET'
    }
    'pages.complexWhere': {
      uri: 'where/{word}-{digit}/{required}/{optional?}/file{extension?}'
      methods: ['GET', 'HEAD']
      wheres: {
        word: '[a-z_-]+'
        digit: '[0-9]+'
        required: 'required'
        optional: 'optional'
        extension: '\\.(php|html)'
      }
      name: 'pages.complexWhere'
      method: 'GET'
    }
    'pages.complexWhereConflict1': {
      uri: 'where/{digit}-{word}/{required}/{optional?}/file{extension?}'
      methods: ['GET', 'HEAD']
      wheres: {
        word: '[a-z_-]+'
        digit: '[0-9]+'
        required: 'required'
        optional: 'optional'
        extension: '\\.(php|html)'
      }
      name: 'pages.complexWhereConflict1'
      method: 'GET'
    }
    'pages.complexWhereConflict2': {
      uri: 'where/complex-{digit}/{required}/{optional?}/file{extension?}'
      methods: ['GET', 'HEAD']
      wheres: {
        digit: '[0-9]+'
        required: 'different_but_required'
        optional: 'optional'
        extension: '\\.(php|html)'
      }
      name: 'pages.complexWhereConflict2'
      method: 'GET'
    }
    pages: {
      uri: '{page}'
      methods: ['GET', 'HEAD']
      name: 'pages'
      method: 'GET'
    }
    slashes: {
      uri: 'slashes/{encoded}/{slug}'
      methods: ['GET', 'HEAD']
      wheres: {
        slug: '.*'
      }
      name: 'slashes'
      method: 'GET'
    }
  }
}
