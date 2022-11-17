<template>
  <div>
    <page-title />

    <navigare-form
      :form="form"
      class="space-y-2"
    >
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label :for="form.getInputId('name')">Name</label>

          <navigare-input name="name" />
        </div>

        <div>
          <label :for="form.getInputId('email')">Email</label>

          <navigare-input
            name="email"
            type="email"
          />
        </div>

        <div>
          <label :for="form.getInputId('phone')">Phone</label>

          <navigare-input name="phone" />
        </div>

        <div>
          <label :for="form.getInputId('address')">Address</label>

          <navigare-input name="address" />
        </div>

        <div>
          <label :for="form.getInputId('city')">City</label>

          <navigare-input name="city" />
        </div>

        <div>
          <label :for="form.getInputId('region')">Region</label>

          <navigare-input name="region" />
        </div>

        <div>
          <label :for="form.getInputId('country')">Country</label>

          <navigare-input name="country" />
        </div>

        <div>
          <label :for="form.getInputId('postal_code')">Postal Code</label>

          <navigare-input name="postal_code" />
        </div>
      </div>

      <div class="flex justify-end">
        <push-button
          variant="primary"
          :processing="form.processing"
          :click="form.submit"
        >
          Create
        </push-button>
      </div>
    </navigare-form>
  </div>
</template>

<script lang="ts" setup>
import Breadcrumbs from '../../components/Breadcrumbs.vue'
import PageTitle from '../../components/PageTitle.vue'
import PushButton from '../../components/PushButton.vue'
import { route } from '@navigare/core'
import {
  createForm,
  NavigareForm,
  NavigareInput,
  useFragment,
  useRouter,
} from '@navigare/vue3'

const form = createForm('organizations.create', route('organizations.store'), {
  name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  region: '',
  country: '',
  postal_code: '',
})
</script>
