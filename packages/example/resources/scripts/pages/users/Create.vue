<template>
  <div>
    <page-title />

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
          <label :for="form.getInputId('email')">Email</label>

          <navigare-input
            name="email"
            type="email"
          />
        </div>

        <div>
          <label :for="form.getInputId('password')">Password</label>

          <navigare-input
            name="password"
            type="password"
          />
        </div>

        <div>
          <label :for="form.getInputId('owner')">Owner</label>

          <select-input name="owner">
            <option :value="true">yes</option>
            <option :value="false">no</option>
          </select-input>
        </div>

        <div>
          <label :for="form.getInputId('photo')">Photo</label>

          <file-input
            name="photo"
            accept="image/*"
          />
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
import FileInput from '../../components/FileInput.vue'
import PageTitle from '../../components/PageTitle.vue'
import PushButton from '../../components/PushButton.vue'
import SelectInput from '../../components/SelectInput.vue'
import { route } from '@navigare/core'
import { createForm, NavigareForm, NavigareInput } from '@navigare/vue3'

const form = createForm(
  'users.store',
  route('users.store'),
  () => ({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    address: '',
    owner: false,
    photo: null,
  }),
  {
    validate: true,
  },
)
</script>
