# Title & Meta

Since JavaScript apps are rendered within the document `<body>`, they are unable to render markup to the document `<head>`, as it's outside of their scope. To help with this, Navigare ships with an `<Head>` component, which can be used to set the page `<title>`, `<meta>` tags, and other `<head>` elements.

## Head component

```vue
import { NavigareHead } from '@navigare/vue3'

<navigare-head>
  <title>Your page title</title>
  <meta name="description" content="Your page description">
</navigare-head>
```

## Multiple instances

It's possible to have multiple instances of the `<navigare-head>` component throughout your application. For example, your layout can set defaults, and then your pages can overide those defaults.

## Extending

In a real app, it can be helpful to create a custom head component that uses the `<navigare-head>` component. This gives you a place to set app-wide defaults, such as appending the app name to the page title. Here's a simple example of what this could look like.

```vue
<template>
  <navigare-head>
    <title>{{ title ? `${title} - My App` : 'My App' }}</title>
  </navigare-head>
</template>

<script lang="ts" setup>
import useBreadcrumbs from '../compositions/useBreadcrumbs'
import { NavigareHead } from '@navigare/vue3'

defineProps({
  title: String,
})
</script>
```

And then use this custom component in your pages:

```vue
import PageTitle from './PageTitle';

<page-title title="About" />
```

## Breadcrumbs

If you already use breadcrumbs on the server and would like to use them as part of the title,then check out the example app. It uses the great [breadcrumbs library by diglactic](https://github.com/diglactic/laravel-breadcrumbs) and already has some [components](https://github.com/navigarejs/framework/tree/main/packages/example/resources/scripts/components/PageTitle.vue) and [compositions](https://github.com/navigarejs/framework/tree/main/packages/example/resources/scripts/compositions/useBreadcrumbs.vue).
