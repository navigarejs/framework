# Layouts

While not required, for most projects it makes sense to create a global site layout that your pages will be embedded in.

# Load layout

In order to use a custom layout, you need to extend the `createApp.ts` (which you created during the [setup](/guide/installation/client)) and pass a custom component (in this case `Layout`) to the children of the `Root` component.

```typescript
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
})
```

# Define Layout

As you can see, there is now a `Layout` component that will receive a `layout` property (see next chapter to find out more). It's a plain Vue component that makes use of the `NavigareFragments` component in different places of the layout. It uses the [fragments](/guide/basics/fragments) that were defined on server side before.

An example for a layout

```vue
<template>
  <div class="relative bg-gray-100 min-h-screen">
    <template v-if="layout === 'unauthenticated'">
      <unauthenticated />
    </template>

    <template v-else>
      <div
        class="fixed top-0 left-0 right-0 h-12 bg-gray-800 text-gray-300 px-4"
      >
        <navigare-fragments name="header" />
      </div>

      <div class="mt-12 px-4 py-4 flex flex-col">
          <div class="w-full">
            <navigare-fragments name="default">
              <template #fragment="{ component, properties }">
                <transition
                  name="fade"
                  mode="out-in"
                >
                  <component :is="component" />
                </transition>
              </template>
            </navigare-fragments>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Unauthenticated from './pages/Unauthenticated.vue'
import { NavigareFragments } from '@navigare/vue3'

defineProps({
  layout: String,
})
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: all 200ms linear;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

You can find an even more complex example with toasts, breadcrumbs and modals in the [example app](https://github.com/navigarejs/framework/tree/main/packages/example/resources/scripts/Layout.vue).

## Use different layouts

As you could see before there is a `layout` property which is passed to the `Layout` component. This is in fact a property which can be set on the server. For example, if you want the layout to be completely different when the user is not authenticated you can simply pass it via `Navigare::layout()`.

```php
<?php

use Navigare\Navigare;

class AuthenticatedSessionController
{
  public function create()
  {
    return Navigare::layout('unauthenticated')->render();
  }
}
```
