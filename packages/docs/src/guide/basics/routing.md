# Routing

## Defining routes

With Navigare all routing is defined server-side. Meaning you don't need any client-side router like `Vue Router`. Simply create routes using your server-side framework of choice.

## Helpers

If you [set up](/guide/installation/client) everything correctly, you will be able to use the `route` function. This function **must** receive a route name in form of a string as a first parameter. You cannot use a variable because we cannot resolve that at build time (yet). The second parameter is a typed version of the parameters that you have defined in Laravel and it will even warn you in case you haven't defined all required parameters.

```typescript
import { route } from '@navigare/core'

route('users.create')

route('users.edit', {
  user,
})

route('users.edit', {
  user: 1,
})

const name = 'users.create'
route(name) // NOT possible
```

For simplicity, there is also a `$route` helper that you can use in Vue templates without the need to import anything else.

```vue
<template>
  <div>
    <navigare-link :route="$route('users.create')"> Create user </navigare-link>
  </div>
</template>

<script lang="ts" setup>
import { NavigareLink } from '@navigare/vue3'
</script>
```

There is no need to use [Ziggy](https://github.com/tightenco/ziggy) or similar tools.
