# Manual visits

In addition to creating links, it's also possible to manually make Navigare visits. This is done using the `router.visit()` method.

```vue
<template>
  <button @click="navigate">Navigate</button>
</template>

<script setup lang="ts">
import { route } from '@navigare/core'
import { useRouter } from '@navigare/vue3'

const router = useRouter()

const navigate = () => {
  router.visit(route('home.index'))
}
</script>
```

## Reload

You can also reload the current page if required.

```vue
<template>
  <button @click="reload">Reload</button>
</template>

<script setup lang="ts">
import { route } from '@navigare/core'
import { useRouter } from '@navigare/vue3'

const router = useRouter()

const navigate = () => {
  router.reload()
}
</script>
```

## Browser history

When making visits, Navigare automatically adds a new entry into the browser history. However, it's also possible to `replace` the current history entry using by setting the replace option to `true`.

```typescript
router.visit(
  route('users.index', {
    query: 'Julian',
  }),
  { replace: true },
)
```

## Component state

By default page visits to the same page force a fresh page component instance, which clears out any local state, such as form inputs, scroll positions and focus states.

In certain situations it's necessary to preserve the page component state. For example, when submitting a form, you need to preserve your form data in the event that validation errors come back.

This can be done by setting the `preserveState` option to `true`.

```typescript
router.visit(
  route('users.index', {
    query: 'Julian',
  }),
  { preserveState: true },
)
```

You can also lazily evaluate the `preserveState` option based on the response by providing a callback.

```typescript
router.visit(route('users.store'), {
  data: {
    name: 'Julian',
  },
  preserveState: (page) => Object.keys(page.properties.errors).length,
})
```

## Scroll preservation

When navigating between pages, Navigare mimics default browser behaviour by automatically resetting the scroll position of the document body (as well as any scroll regions you've defined), back to the top. Use the `preserveScroll` option to disable this behaviour.

```typescript
router.visit(route('users.store'), {
  data: {
    name: 'Julian',
  },
  preserveScroll: true,
})
```

You can also lazily evaluate the `preserveScroll` option based on the response by providing a callback.

```typescript
router.visit(route('users.index'), {
  data: {
    name: 'Julian',
  },
  preserveScroll: (page) => Object.keys(page.properties.errors).length,
})
```

## Partial reloads

The `properties` option allows you to request a subset of the properties from the server on subsequent visits to the same page.

```typescript
router.visit(route('users.index'), { properties: ['users'] })
```

In case the property is part of a non-default fragment, you can prepend the name of the fragment and separate it with a slash:

```typescript
router.visit(
  route('events.show', {
    id: 1,
  }),
  { properties: ['sidebar/participants'] },
)
```

## File uploads

When making visits that include files, Navigare will automatically convert the request data into a `FormData` object. If you'd like the visit to always use a `FormData` object, you can force this using the `forceFormData` option.

```typescript
router.visit(route('events.store'), {
  data,
  forceFormData: true,
})
```

## Custom headers

The `headers` option allows you to add custom headers to a request.

```typescript
router.visit(route('users.index'), {
  headers: {
    'Custom-Header': 'value',
  },
})
```

:::info
The Navigare headers take priority and therefore cannot be overwritten.
:::

## Event callbacks

Navigare provides a number of per-visit event callbacks:

```typescript
router.visit(route('users.index'), {
  events: {
    before: () => {},
    start: () => {},
    progress: () => {},
    finish: () => {},
    cancel: () => {},
    navigate: () => {},
    success: () => {},
    error: () => {},
    invalid: () => {},
    exception: () => {},
  },
})
```

## Visit cancellation

You can cancel any visit via the `cancel` method.

```typescript
const visit = await router.visit(route('users.index'))

visit.cancel()
```

You can also use the event `before` callback to cause the same.

```typescript
router.visit(route('users.index'), {
  events: {
    before: (event) => {
      event.preventDefault()
    },
  },
})
```

When a visit is cancelled, both the `cancel` and `finish` event callbacks will be called.
