<template>
  <div>
    <page-title />

    <navigare-form
      :form="form"
      class="space-y-2"
    >
      {{ form.dirty }}
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

          <select-input name="organization_id">
            <option value=""></option>
            <option
              v-for="organization in organizations"
              :key="organization.id"
              :value="organization.id"
            >
              {{ organization.name }}
            </option>
          </select-input>
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

    {{ contactForm.dirty }}
    <navigare-form
      :form="contactForm"
      class="space-y-2"
    >
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
    </navigare-form>
  </div>
</template>

<script lang="ts" setup>
import PageTitle from '../../components/PageTitle.vue'
import PushButton from '../../components/PushButton.vue'
import SelectInput from '../../components/SelectInput.vue'
import { route } from '@navigare/core'
import {
  createForm,
  NavigareForm,
  NavigareInput,
  useRouter,
} from '@navigare/vue3'
import { toRef } from '@vue/reactivity'
import { reactive } from 'vue'

defineProps({
  organizations: Object,
})

const router = useRouter()

const form = createForm(
  'contacts.create',
  route('contacts.store'),
  () => ({
    first_name: '',
    last_name: '',
    organization_id: router.page.parameters.organization_id ?? '',
    email: '',
    phone: '',
    address: '',
    city: '',
    region: '',
    country: '',
    postal_code: '',
  }),
  {
    validate: false,
  },
)

const contactForm = form.partial(
  'contacts.create.contact',
  () => () => {},
  (values) => {
    return reactive({
      email: toRef(values, 'email'),
      phone: toRef(values, 'phone'),
    })
  },
)
</script>
