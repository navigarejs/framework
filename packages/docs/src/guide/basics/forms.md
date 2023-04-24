# Forms

## Submitting forms

While it's possible to make classic form submissions with Navigare, it's not recommended, as they cause full page reloads. Instead, it's better to intercept form submissions and then make the request using Navigare. Navigare comes with some helpful components that simplifies this process significantly:

```vue
<template>
  <navigare-form
    :form="form"
    class="space-y-2"
  >
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label :for="form.getInputId('first_name')">First Name</label>

        <navigare-input name="first_name" />
      </div>

      <div>
        <label :for="form.getInputId('last_name')">Last Name</label>

        <navigare-input name="last_name" />
      </div>

      <div>
        <label :for="form.getInputId('organization_id')">Organization</label>

        <navigare-input
          name="organization_id"
          #default="{ ref, attributes, events, value }"
        >
          <select
            v-bind="{
              ref,
              ...attributes,
              ...events,
            }"
            v-model="value.value"
          >
            <option value=""></option>
            <option
              v-for="organization in organizations"
              :key="organization.id"
              :value="organization.id"
            >
              {{ organization.name }}
            </option>
          </select>
        </navigare-input>
      </div>

      <div>
        <label :for="form.getInputId('email')">Email</label>

        <navigare-input
          name="email"
          type="email"
        />
      </div>

    <div class="flex justify-end">
      <button
        type="button"
        :disabled="form.processing"
        :click="form.submit"
      >
        Create
      </Save>
    </div>
  </navigare-form>
</template>

<script lang="ts" setup>
import { route } from '@navigare/core'
import {
  createForm,
  NavigareForm,
  NavigareInput,
  useRouter,
} from '@navigare/vue3'
import { PropType } from 'vue'

defineProps({
  organizations: Object as PropType<{
    id: string
    name: string
  }[]>,
})

const router = useRouter()

const form = createForm('contacts.create', () => ({
  first_name: '',
  last_name: '',
  organization_id: router.page.parameters.organization_id ?? '',
  email: '',
}), route('contacts.store'))
</script>
```

Unlike a classic ajax submitted form, with Navigare you don't handle the post submission behaviour client-side. Rather, you do this server-side using a redirect. And, of course, there is nothing stopping you from redirecting right back to the page that you're on.

```php
<?php

namespace App\Http\Requests\Users;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRequest extends FormRequest
{
  /**
   * Get the validation rules that apply to the request.
   *
   * @return array
   */
  public function rules()
  {
    return [
      'first_name' => ['required', 'max:50'],
      'last_name' => ['required', 'max:50'],
      'email' => ['required', 'max:50', 'email', Rule::unique('users')],
    ];
  }
}
```

```php
<?php

class UsersController
{
  public function index()
  {
    return Navigare::render('Users/Index', [
      'users' => User::all(),
    ]);
  }

  public function store(StoreRequest $request)
  {
    User::create(Request::validated());

    return Redirect::route('users.index');
  }
}
```

## Validation via Precognition

Navigare can already validate the user's input in real-time when Precognition is enabled. Simply add `\Illuminate\Foundation\Http\Middleware\HandlePrecognitiveRequests::class` **before** the Navigare middleware.

## Server-side validation

Handling server-side validation errors in Navigare works a little different than a classic ajax-driven form, where you catch the validation errors from `422` responses and manually update the form's error state. That's because Navigare never receives `422` responses. Rather, Navigare operates much more like a standard full page form submission.

## Form helper

Since working with forms is so common, Navigare comes with a form helper designed to help reduce the amount of boilerplate needed for typical forms. Simply pass the name of the form, the target and the initial values as an object or callback. If you provide a callback for the initial values, it has the advantage that the value can be reactive. Here's how to use it:

```typescript
import { route } from '@navigare/core'
import { createForm, useRouter } from '@navigare/vue3'

const props = defineProps({
  email: String,
})

const form = createForm(
  'contacts.create',
  () => ({
    first_name: '',
    last_name: '',
    email: props.email,
  }),
  route('contacts.store'),
)
```

To submit the form, simply use `submit`

```typescript
form.submit()
```

The submit methods support all the regular [visit options](/guide/basics/manual-visits), such as `preserveState`, `preserveScroll`, and the event callbacks. This can be helpful for performing tasks on successful form submissions, such as resetting inputs.

If you want to reset the form to its initial values, use `reset`:

```typescript
form.reset()
```

You can use the `processing` property to track if a form is currently being submitted. This can be helpful for preventing double form submissions, by disabling the submit button.

```vue
<button type="submit" :disabled="form.processing">Submit</button>
```

In the event that you're uploading files, the current progress event is available via the `progress` property. This is helpful for showing upload progress. For example:

```vue
<progress v-if="form.progress.percentage" :value="form.progress.percentage" max="100">
  {{ form.progress.percentage }}%
</progress>
```

In the event there are form errors, they are available via the errors property.

```vue
<div v-if="form.errors.email">{{ form.errors.email }}</div>
```

To check if a form has any errors, simply check the `valid` property. To clear form errors, use the `clearErrors` method.

```typescript
// Clear all errors
form.clearErrors()

// Clear errors for specific fields
form.clearErrors(['field', 'anotherfield'])
```

If you're using a client-side input validation libraries or do additional checks of your own, you can also set your own errors on the form by using the `setErrors` method.

```typescript
// Set a single error
form.setError('field', 'Your error message.')

// Set multiple errors at once
form.setErrors({
  foo: 'Your error message for the foo field.',
  bar: 'Some other error for the bar field.',
})
```

When a form has been successfully submitted, the `successful` property will be true. In addition to this, there is also a `recentlySuccessful` property, which will be set to true for two seconds after a successful form submission. This is helpful for showing temporary success messages.

To have form helper data and errors automatically remembered in history state, you can provide `remember` to the options.

```typescript
const form = createForm(
  'contacts.create',
  () => ({
    first_name: '',
  }),
  route('contacts.store'),
  {
    remember: true,
  },
)
```

To check if a form has any changes, use the `dirty` property.

```vue
<div v-if="form.dirty">here are unsaved form changes.<</div>
```

## File uploads

When making visits that include files, Navigare will automatically convert the request data into a `FormData` object.

## Local submissions

In case you don't want to send the form to the server, you can also provide a double callback to the form. Note the doubled arrow function in the second parameter to the function.

```typescript
const form = createForm(
  'contacts.validate',
  () => ({
    first_name: '',
  }),
  () => (values) => {
    console.log('The form was submitted: %o', values)
  },
  {
    remember: true,
  },
)
```
