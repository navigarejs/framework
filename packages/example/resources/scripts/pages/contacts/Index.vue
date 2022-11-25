<template>
  <div>
    <breadcrumbs />

    <page-title />

    <div class="flex items-center justify-between mb-6">
      <div></div>

      <push-button
        variant="primary"
        :route="$route('contacts.create')"
      >
        <span>Create</span>
        <span class="hidden md:inline">&nbsp;Contact</span>
      </push-button>
    </div>

    <card :padded="false">
      <table class="w-full whitespace-nowrap">
        <thead>
          <tr class="text-left font-bold">
            <th class="pb-4 pt-6 px-6">Name</th>
            <th class="pb-4 pt-6 px-6">Organization</th>
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
            v-for="contact in contacts.data"
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
                <div v-if="contact.organization">
                  {{ contact.organization.name }}
                </div>
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
          <tr v-if="contacts.data.length === 0">
            <td
              class="px-6 py-4 border-t"
              colspan="4"
            >
              No contacts found.
            </td>
          </tr>
        </tbody>
      </table>

      <pagination
        class="mt-6"
        :links="contacts.links"
      />
    </card>
  </div>
</template>

<script lang="ts" setup>
import Breadcrumbs from '../../components/Breadcrumbs.vue'
import Card from '../../components/Card.vue'
import Icon from '../../components/Icon.vue'
import PageTitle from '../../components/PageTitle.vue'
import Pagination from '../../components/Pagination.vue'
import PushButton from '../../components/PushButton.vue'
import { NavigareLink } from '@navigare/vue3'

defineProps({
  filters: Object,
  contacts: Object,
})
</script>
