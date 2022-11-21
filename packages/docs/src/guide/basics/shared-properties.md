# Shared properties

Sometimes you need to access certain data on numerous pages within your application. For example, a common use-case for this is showing the current user in the site header. Passing this data manually in each response isn't practical. In these situations shared properties can be useful.

## Sharing data

The server-side adapters provide a way to preassign shared properties for each request. This is typically done outside of your controllers. Shared properties will be automatically merged with the page props provided in your controller.

```php
class HandleNavigareRequests extends Middleware
{
  public function share(Request $request)
  {
    return [
      // Synchronously
      'appName' => config('app.name'),

      // Lazily
      'user' => fn() => $request->user()
        ? $request->user()->only('id', 'name', 'email')
        : null,
    ];
  }
}
```

## Accessing shared data

Once you've shared the properties server-side, you'll then be able to access it within your page components as properties. properties data can even be accessed in non-page components, although not as properties in those cases. Here's an example of how to do this in a layout component.

```vue
<template>
  <main>
    <header>You are logged in as: {{ user.name }}</header>
    <content>
      <slot />
    </content>
  </main>
</template>

<script lang="ts" setup>
import { usePage } from '@navigare/usePage'
import { computed } from 'vue'

const page = usePage()

const user = computed(() => page.properties.user)
</script>
```

## Flash messages

Another great use-case for shared properties is flash messages. These are messages stored in the session only for the next request. You'll often set a flash message after completing a task and before redirecting to a different page.

Here's a simple way to implement flash messages in your Navigare applications. First, share the flash message on each request.

```php
class HandleNavigareRequests extends Middleware
{
  public function share(Request $request)
  {
    return [
      'flash' => function () use ($request) {
        return [
          'success' => $request->session()->get('success'),
          'error' => $request->session()->get('error'),
        ];
      },
    ];
  }
}
```

Next, display the flash message in a front-end component, such as the site layout.

```vue
<template>
  <output
    v-for="message in messages"
    :key="message.id"
    role="status"
    class="message p-2 rounded"
    :class="{
      'bg-red-200': message.type === 'error',
      'bg-indigo-200': message.type === 'success',
    }"
  >
    {{ message.text }}
  </output>
</template>

<script lang="ts" setup>
import { usePage } from '@navigare/vue3'
import { ref, watch } from 'vue'

const page = usePage()

// Watch flash messages
const messages = ref<
  {
    id: string
    type: 'success' | 'error'
    text: string
  }[]
>([])
watch(
  () => page.properties.flash,
  ({ success: nextSuccess, error: nextError }) => {
    if (nextSuccess) {
      messages.value.push({
        id: Math.random().toString(),
        type: 'success',
        text: nextSuccess,
      })
    }

    if (nextError) {
      messages.value.push({
        id: Math.random().toString(),
        type: 'error',
        text: nextError,
      })
    }
  },
)
</script>
```
