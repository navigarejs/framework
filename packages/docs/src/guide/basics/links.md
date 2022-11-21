# Links

To create links within an Navigare app you'll need to use the Navigare link component. This is a light wrapper around a standard anchor `<a>` link that intercepts click events and prevents full page reloads from occurring. This is how Navigare provides a single-page app experience.

## Creating links

To create an Navigare link, use the Navigare `<navigare-link>` component. Pass any route that you use on your server side via the `route` property and Navigare will automatically infer the method and destination. Any other attributes you provide will be proxied to the underlying tag.

```vue
<template>
  <navigare-link :route="$route('contacts.create')">Contacts</navigare-link>
</template>

<script lang="ts" setup>
import { NavigareLink } from '@navigare/vue3'
</script>
```

By default Navigare renders links as anchor `<a>` elements. However, you can change the tag using the `as` attribute.

```vue
<template>
  <navigare-link
    :route="$route('auth.logout')"
    as="button"
    type="button"
    >Logout</navigare-link
  >
</template>

<script lang="ts" setup>
import { NavigareLink } from '@navigare/vue3'
</script>
```

This will render as `<button type="button">Logout</button>`.

:::warning
Creating `POST`/`PUT`/`PATCH`/`DELETE` anchor `<a>` links is discouraged as it causes "Open Link in New Tab/Window" accessibility issues. Instead, consider using a more appropriate element, such as a `<button>`.
:::

## Headers

The `headers` option allows you to add custom headers to an Navigare link. Do note that Navigare's headers take priority and therefore cannot be overwritten.

```vue
<template>
  <navigare-link
    :route="$route('contacts.create')"
    as="button"
    type="button"
    :headers="{ foo: 'bar' }"
    >Create</navigare-link
  >
</template>

<script lang="ts" setup>
import { NavigareLink } from '@navigare/vue3'
</script>
```

## Replace

You can specify the browser history behaviour. By default page visits push (new) state (`window.history.pushState`) into the history, however it's also possible to replace state (`window.history.replaceState`) by setting the `replace` attribute to true. This will cause the visit to replace the current history state, instead of adding a new history state to the stack.

```vue
<template>
  <navigare-link
    :route="$route('home.index')"
    replace
    >Home</navigare-link
  >
</template>

<script lang="ts" setup>
import { NavigareLink } from '@navigare/vue3'
</script>
```

## Preserve state

You can preserve a page component's local state using the `preserve-state` attribute. This will prevent a page component from fully re-rendering. This is especially helpful with forms, since you can avoid manually repopulating input fields, and can also maintain a focused input.

```vue
<template>
  <input
    v-model="query"
    type="text"
  />
  <navigare-link
    :route="$route('contacts.search')"
    :data="{ query }"
    preserve-state
    >Search</navigare-link
  >
</template>

<script lang="ts" setup>
import { NavigareLink } from '@navigare/vue3'
</script>
```

## Preserve scroll

You can use the `preserve-scroll` attribute to prevent Navigare from automatically resetting the scroll position when making the visit.

```vue
<template>
  <navigare-link
    :route="$route('home.index')"
    preserve-scroll
    >Home</navigare-link
  >
</template>

<script lang="ts" setup>
import { NavigareLink } from '@navigare/vue3'
</script>
```

## Partial reloads

The `properties` option allows you to request a subset of the properties from the server on subsequent visits to the same page.

```vue
<template>
  <navigare-link
    :route="
      $route('users.index', {
        active: true,
      })
    "
    :properties="['users']"
    >Show active</navigare-link
  >
</template>

<script lang="ts" setup>
import { NavigareLink } from '@navigare/vue3'
</script>
```

## Active states

It's often desireable to set an active state for navigation links based on the current page. You can use the `active-class` and `inactive-class` property to define dynamic classes that will be added to the element whenever the link matches the current location.

```vue
<template>
  <navigare-link
    :route="$route('users.index')"
    active-class="big"
    inactive-class="small"
  >
    Users
  </navigare-link>
</template>

<script lang="ts" setup>
import { NavigareLink } from '@navigare/vue3'
</script>
```

In some scenarios, it is also required to indicate the link as active when a subpage is opened. In that case you can pass an array to the `route` property. The first index defines the actual target and all subsequent routes will be used to match against the current location. You can pass specific routes, patterns (where `*` matches anything) or routes with a wildcard:

```vue
<template>
  <navigare-link
    :route="[
      $route('users.index'),
      // Pattern
      'users.*',
      // Specific route
      $route('users.details', ({ Wildcard }) => ({
        id: 1,
      })),
      // Wildcard route
      $route('users.details', ({ Wildcard }) => ({
        id: Wildcard,
      })),
    ]"
    active-class="highlight"
  >
    Users
  </navigare-link>
</template>

<script lang="ts" setup>
import { NavigareLink } from '@navigare/vue3'
</script>
```
