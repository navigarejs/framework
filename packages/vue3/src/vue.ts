import 'vue'

declare module 'vue' {
  interface ComponentCustomProperties {
    route: typeof import('@navigare/core').createRoute
  }
}
