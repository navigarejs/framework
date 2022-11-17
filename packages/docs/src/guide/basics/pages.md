# Pages

With Navigare, each page in your application has its own controller and corresponding JavaScript component. This allows you to retrieve just the data necessary for that page, no API required.

## Locating components

By default, all components must be located in `resources/scripts/pages`. If you want them to be in a different place, you need to change the [configuration](/guide/basics/configuration).

## Creating pages

Pages are simply JavaScript components. There is nothing particularly special about them. Pages receive data from the controllers as properties. Here's an example of a simple page component.

```vue
<template>
  <div>
    <navigare-head>
      <title>Welcome</title>
    </navigare-head>

    <h1>Welcome</h1>

    <p>Hello {{ user.name }}, welcome to your first Navigare app!</p>
  </div>
</template>

<script lang="ts" setup>
import { NavigareHead } from '@navigare/vue3'
import { PropType } from 'vue'

defineProps({
  user: Object as PropType<{
    name: string
  }>,
})
</script>
```

:::info
If you would like to render more than one "page" per response, please have a look at [fragments](/guide/basics/fragments). It will give you the possibility, to define persistent headers, side navigations or modals.
:::
