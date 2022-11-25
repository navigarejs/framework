<template>
  <div>
    <div class="flex flex-row justify-between">
      <div>
        <breadcrumbs />

        <page-title />
      </div>

      <div class="flex items-center">
        <push-button
          v-if="!organization.deleted_at"
          :route="
            $route('organizations.destroy', {
              organization,
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

    <div class="space-y-4">
      <card>
        <message
          :visible="!!organization.deleted_at"
          variant="warning"
        >
          <template #icon>
            <icon
              name="trash"
              class="w-6 h-6"
            />
          </template>

          This organization has been deleted.

          <template #action>
            <push-button
              :route="
                route('organizations.restore', {
                  organization,
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
              Update
            </push-button>
          </div>
        </navigare-form>
      </card>

      <card
        :padded="false"
        title="Contacts"
      >
        <template #actions>
          <push-button
            :route="
              $route('contacts.create', {
                organization_id: organization.id,
              })
            "
            variant="secondary"
          >
            <span>Create</span>
            <span class="hidden md:inline">&nbsp;Contact</span>
          </push-button>
        </template>

        <table class="w-full whitespace-nowrap">
          <thead>
            <tr class="text-left font-bold">
              <th class="pb-4 pt-6 px-6">Name</th>
              <th class="pb-4 pt-6 px-6">City</th>
              <th
                class="pb-4 pt-6 px-6"
                colspan="2"
              >
                Phone
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="contact in contacts"
              :key="contact.id"
              class="hover:bg-gray-100 focus-within:bg-gray-100"
            >
              <td class="border-t">
                <navigare-link
                  class="flex items-center px-6 py-4 focus:text-indigo-500"
                  :route="
                    $route('contacts.edit', {
                      contact,
                    })
                  "
                >
                  {{ contact.name }}

                  <icon
                    v-if="contact.deleted_at"
                    name="trash"
                    class="flex-shrink-0 ml-2 w-3 h-3 fill-gray-400"
                  />
                </navigare-link>
              </td>
              <td class="border-t">
                <navigare-link
                  class="flex items-center px-6 py-4"
                  :route="
                    $route('contacts.edit', {
                      contact,
                    })
                  "
                  tabindex="-1"
                >
                  {{ contact.city }}
                </navigare-link>
              </td>
              <td class="border-t">
                <navigare-link
                  class="flex items-center px-6 py-4"
                  :route="
                    $route('contacts.edit', {
                      contact,
                    })
                  "
                  tabindex="-1"
                >
                  {{ contact.phone }}
                </navigare-link>
              </td>
              <td class="w-px border-t">
                <navigare-link
                  class="flex items-center px-4"
                  :route="
                    $route('contacts.edit', {
                      contact,
                    })
                  "
                  tabindex="-1"
                >
                  <icon
                    name="cheveron-right"
                    class="block w-6 h-6 fill-gray-400"
                  />
                </navigare-link>
              </td>
            </tr>
            <tr v-if="contacts.length === 0">
              <td
                class="px-6 py-4 border-t"
                colspan="4"
              >
                No contacts found.
              </td>
            </tr>
          </tbody>
        </table>
      </card>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Breadcrumbs from '../../components/Breadcrumbs.vue'
import Card from '../../components/Card.vue'
import Icon from '../../components/Icon.vue'
import Message from '../../components/Message.vue'
import PageTitle from '../../components/PageTitle.vue'
import PushButton from '../../components/PushButton.vue'
import useBreadcrumbs from '../../compositions/useBreadcrumbs'
import { route } from '@navigare/core'
import {
  createForm,
  NavigareInput,
  NavigareForm,
  NavigareLink,
} from '@navigare/vue3'

const props = defineProps({
  organization: Object,
  contacts: Array,
})

const breadcrumbs = useBreadcrumbs()

const form = createForm(
  'organizations.edit',
  route('organizations.update', {
    organization: props.organization,
  }),
  () => ({
    name: props.organization.name,
    email: props.organization.email,
    phone: props.organization.phone,
    address: props.organization.address,
    city: props.organization.city,
    region: props.organization.region,
    country: props.organization.country,
    postal_code: props.organization.postal_code,
  }),
  {
    validate: true,
  },
)
</script>
