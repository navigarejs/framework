import '../css/app.pcss'
import Layout from './Layout.vue'
import { createNavigareApp } from '@navigare/vue3'
import { createApp as createVueApp, h } from 'vue'

export default createNavigareApp({
  setup({ Root, props, initialPage }) {
    console.log('Initial page %o', initialPage)

    // Create Vue app with Navigare component as root component
    const app = createVueApp({
      render: () => {
        return h(Root, props, {
          default: ({ layout }) => h(Layout, { layout }),
        })
      },
    })

    return app
  },

  events: {
    navigate: (event) => {
      console.log('Navigated to %o', event.detail.page)
    },
  },

  fragments: {
    default: {},

    header: {
      inert: ({ nextFragments }) => {
        return !!nextFragments.modal
      },
    },

    left: {
      lazy: true,
      inert: ({ nextFragments }) => {
        return !!nextFragments.modal
      },
    },

    modal: {
      stacked: true,
    },
  },
})
