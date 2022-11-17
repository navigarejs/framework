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

You can also lazily evaluate the preserveState option based on the response by providing a callback.

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
