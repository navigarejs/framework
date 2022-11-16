import '../css/app.pcss'
import '../css/base.pcss'
import Layout from './Layout.vue'
import { Page } from '@navigare/core'
import { createNavigareApp } from '@navigare/vue3'
import { createApp as createVueApp, h } from 'vue'

export default function createApp(initialPage?: Page) {
  return createNavigareApp({
    initialPage,

    setup({ Root, props }) {
      // Create Vue app with Navigare component as root
      const app = createVueApp({
        render: () => {
          return h(Root, props, {
            default: ({}) => h(Layout, {}),
          })
        },
      })

      return app
    },

    fragments: {
      default: {},

      left: {
        lazy: false,
      },

      modal: {
        stacked: true,
      },
    },
  })
}
