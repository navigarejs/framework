import '../css/app.css'
import Layout from './Layout.vue'
import { Page } from '@navigare/core'
import { createNavigareApp } from '@navigare/vue3'
import { createApp as createVueApp, h } from 'vue'

export default function createApp(initialPage?: Page) {
  return createNavigareApp({
    initialPage,

    setup({ Root, props, plugin: navigarePlugin }) {
      // Create Vue app with Navigare component as root
      const app = createVueApp({
        render: () => {
          return h(Root, props, () => h(Layout))
        },
      })

      return app
    },

    fragments: {
      modal: {
        stacked: true,
      },
    },
  })
}
