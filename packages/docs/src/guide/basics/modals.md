# Modals

Modals are a specific use case of [fragments](/guide/basics/fragments) and they are quite easy to use.

# Definition

In order to use (stacked) modals, you should load a [custom layout](/guide/basics/layouts#load-layout) and also define the `modal` fragment as `stacked`. You don't need to call it `modal`, you can also choose any other name but just keep it consistent. You could even have multiple stacked fragments if required.

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

  fragments: {
    modal: {
      stacked: true,
    },
  },
})
```

# Layout

Once defined as stacked, you can render these in the layout.

```vue
<template>
  <div>
    <navigare-fragments name="default" />

    <navigare-fragments
      name="modal"
      #default="{ fragments }"
    >
      <div
        class="fixed inset-0 flex items-center justify-center overflow-hidden transition-all"
        :class="{
          'pointer-events-none': fragments.length === 0,
          'bg-black/50': fragments.length > 0,
        }"
      >
        <transition-group name="slide-bottom">
          <template
            v-for="(fragment, index) in fragments"
            :key="index"
          >
            <component
              :is="fragment.component"
              :class="{
                'scale-75': index < fragments.length - 1,
              }"
            />
          </template>
        </transition-group>
      </div>
    </navigare-fragments>
  </div>
</template>

<script lang="ts" setup>
import { NavigareFragments } from '@navigare/vue3'

defineProps({
  layout: String,
})
</script>

<style>
.slide-bottom-enter-active,
.slide-bottom-leave-active {
  transition: all 200ms ease-out;

  & > div {
    transition: all 200ms ease-out;
  }
}

.slide-bottom-enter-from,
.slide-bottom-leave-to {
  opacity: 0;

  & > div {
    transform: translateY(20%);
  }
}
</style>
```

The previous example uses Vue transitions to nicely animate these modals. You could also use `<navigare-fragments name="modal" />` to render these plain one after the other.

# Response

Eventually, you just need to respond with the `modal` fragment (see [fragments](/guide/basics/fragments)). Optionally, you can define a route that will be visible in the background via `extends`.

```php
<?php

namespace App\Http\Controllers;

use Navigare\Navigare;

class ContactsController
{
  public function index()
  {
    return Navigare::render('contacts/Index', []);
  }

  public function create()
  {
    return Navigare::modal('contacts/Create', [
      'organizations' => Auth::user()
        ->account->organizations()
        ->orderBy('name')
        ->get()
        ->map->only('id', 'name'),
    ])->extends(route('contacts.index'));
  }
}
```
