<template>
  <div>
    <div class="flex flex-row justify-between">
      <div>
        <breadcrumbs />

        <page-title />
      </div>

      <div class="flex items-center">
        <push-button
          v-if="!contact.deleted_at"
          :route="
            $route('contacts.destroy', {
              contact,
            })
          "
          variant="danger"
        >
          <template #icon>
            <icon
              name="trash"
              class="w-6 h-6"
            />
          </template>

          Delete
        </push-button>
      </div>
    </div>

    <card>
      <message
        :visible="!!contact.deleted_at"
        variant="warning"
      >
        <template #icon>
          <icon
            name="trash"
            class="w-6 h-6"
          />
        </template>

        This contact has been deleted.

        <template #action>
          <push-button
            :route="
              $route('contacts.restore', {
                contact,
              })
            "
          >
            Restore
          </push-button>
        </template>
      </message>

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
            <label :for="form.getInputId('organization_id')"
              >Organization</label
            >

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
            Update
          </push-button>
        </div>
      </navigare-form>
    </card>
  </div>
</template>

<script lang="ts" setup>
import Breadcrumbs from '../../components/Breadcrumbs.vue'
import Card from '../../components/Card.vue'
import Icon from '../../components/Icon.vue'
import Message from '../../components/Message.vue'
import PageTitle from '../../components/PageTitle.vue'
import PushButton from '../../components/PushButton.vue'
import SelectInput from '../../components/SelectInput.vue'
import { route } from '@navigare/core'
import { createForm, NavigareInput, NavigareForm } from '@navigare/vue3'

const props = defineProps({
  contact: Object,
  organizations: Object,
})

const form = createForm(
  'contacts.create',
  $route('contacts.update', {
    contact: props.contact,
  }),
  () => ({
    first_name: props.contact.first_name,
    last_name: props.contact.last_name,
    organization_id: props.contact.organization_id,
    email: props.contact.email,
    phone: props.contact.phone,
    address: props.contact.address,
    city: props.contact.city,
    region: props.contact.region,
    country: props.contact.country,
    postal_code: props.contact.postal_code,
  }),
)
</script>
