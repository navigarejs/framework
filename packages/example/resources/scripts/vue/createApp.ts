import '../../css/app.css'
import Layout from './Layout.vue'
import { Page } from '@navigare/core'
import { createNavigareApp } from '@navigare/vue3'
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers'
import { createApp as createVueApp, h } from 'vue'

export default function createApp(initialPage?: Page) {
  return createNavigareApp({
    id: 'app',

    setup({ App, props, plugin }) {
      const app = createVueApp({ render: () => h(App, props) })

      app.use(plugin)

      return app
    },

    resolveComponent: (name) =>
      resolvePageComponent(
        `./pages/${name}.vue`,
        import.meta.glob('./pages/**/*.vue'),
      ),

    initialPage,

    layoutComponent: Layout,

    fragments: {
      modal: {
        stacked: true,
      },
    },
  })
}
