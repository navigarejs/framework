# Server Side Rendering

Server-side rendering allows you to pre-render an initial page visit on the server, and to send the rendered HTML to the browser. This allows visitors to see and interact with your pages before they have fully loaded, and also provides other benefits such as decreasing the time it takes for search engines to index your site.

Navigare supports SSR out of the box and it's enabled by default. You can turn it off any time via the [configuration](/guide/basics/configuration).

## How it works

When Navigare detects that it's running in a Node.js environment, it will automatically render the provided page object to HTML and return it.

However, because most Navigare applications are built in languages such as PHP or Ruby, we'll need to hand the request over to a separate Node.js service so that it can render the page for us, and return the rendered HTML back to the browser when it's done.

## Setting up server side rendering

In order to use SSR you will need a separate entrypoint. Please check the
[client](/guide/installation/client) setup to see how the `ssr.ts` file should looke like. You can also choose any other file name but in that case you will need to adjust the [configuration](/guide/basics/configuration).

## Development

In development you don't need to do anything special because Navigare will do everything for you. Simply ensure that you don't try to access objects that are only available in the browser like `window`. Navigare ships with a helper to differentiate in which environment you are.

```typescript
import { isSSR } from '@navigare/core'

if (isSSR()) {
  // window is not available
} else {
  // window is available
}
```

## Production

In order to use SSR in production you need to build two different versions with Vite. One for the client and one for the server:

```sh
vite build && vite build --ssr
```

Typically, the server version will be build into `bootstrap/ssr` and the client into `public/build` If that's not the case, adjust the [configuration](/guide/basics/configuration).

Once built, you need to run another server along the PHP server. You can use the Navigare CLI for that. If you don't have i yet, you can simply install it via `npm`.

```sh
npm install add @navigare/cli
```

Afterwards you can start the server via `serve`:

```sh
npx navigare serve
```

By default, it will run on port `13715` but you can also choose a different one:

```sh
npx navigare serve --port 1337
```
