import 'vue'

declare module '@vue/runtime-core' {
  export interface ComponentCustomProperties {
    route: typeof import('@navigare/core').createRoute
  }
}
