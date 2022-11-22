import '../css/app.pcss'
import Layout from './Layout.vue'
import { createNavigareApp } from '@navigare/vue3'
import { createApp as createVueApp, h } from 'vue'

export default createNavigareApp({
  setup({ Root, props }) {
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

  fragments: {
    default: {},

    left: {
      lazy: false,
    },

    modal: {
      stacked: true,
    },
  },

  transformServerProperty: (value) => {
    console.log(value)
    return value
  },
})
