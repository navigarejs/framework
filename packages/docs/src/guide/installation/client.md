# Client

Once you have your [server-side framework configured](/guide/installation/server), you then need to setup your client-side framework. Navigare currently provides support for Vue. Other adapters might come in the future as well.

## Install dependencies

If you use `npm`, you can install the client-side adapter using the following commands:

```sh
npm install @navigare/cli axios qs
npm install @navigare/core @navigare/vite @navigare/vue3 --dev
```

## Add Vite plugin

In contrast to Navigare, Navigare requires Vite as a preprocessor and build tool. Navigare ships with a plugin that should be inserted in the `plugins` section of the Vite configuration in `vite.config.ts`. Note that we also use the new recommended Laravel plugin as well so make sure that you refer to the same file in the root template (see [Root Template](/guide/installation/server#root-template)).

```typescript
import navigare from '@navigare/vite'
import vue from '@vitejs/plugin-vue'
import laravel from 'laravel-vite-plugin'
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    alias: {
      '@scripts': '/resources/scripts',
    },
  },

  plugins: [
    laravel({
      input: ['resources/scripts/client.ts'],
      refresh: true,
    }),

    vue({
      template: {
        transformAssetUrls: {
          // The Vue plugin will re-write asset URLs, when referenced
          // in Single File Components, to point to the Laravel web
          // server. Setting this to `null` allows the Laravel plugin
          // to instead re-write asset URLs to point to the Vite
          // server instead.
          base: null,

          // The Vue plugin will parse absolute URLs and treat them
          // as absolute paths to files on disk. Setting this to
          // `false` will leave absolute URLs un-touched so they can
          // reference assets in the public directory as expected.
          includeAbsolute: false,
        },
      },
    }),

    navigare(),
  ],
})
```

## Initialize app

Next, update your main JavaScript file to boot your Navigare app. Ideally, we name this file `client.ts` because it is the entrypoint for the client. All we're doing here is initializing the client-side framework with the base Navigare app.

```typescript
import createApp from './createApp'
import { mountApp } from '@navigare/vue3'

createApp().then((app) => {
  mountApp(app)
})
```

As you can see this file imports the `createApp` function from `createApp.ts` and this is the heart of the application. It creates an instance of the Navigare application which can be used on the client but also on the server.

```typescript
import { createNavigareApp } from '@navigare/vue3'
import { createApp as createVueApp, h } from 'vue'

export default createNavigareApp({
  setup({ Root, props }) {
    // Create Vue app with Navigare component as root component
    const app = createVueApp({
      render: () => {
        return h(Root, props)
      },
    })

    // Register any other Vue plugins, e.g.:
    // app.use(i18n)
    // app.directive('emojis')

    return app
  },
})
```

Just to make the picture complete, you also need a separate entrypoint for the server-side rendered version. This will be in `ssr.ts`:

```typescript
import createApp from './createApp'
import { RenderApp } from '@navigare/ssr'
import { renderNavigareApp } from '@navigare/vue3'

const renderApp: RenderApp = async (page) => {
  const app = await createApp(page)

  return await renderNavigareApp(app)
}

export default renderApp
```
