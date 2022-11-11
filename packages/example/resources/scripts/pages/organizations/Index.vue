<template>
  <div>
    <breadcrumbs />

    <page-title />

    <div class="flex items-center justify-between mb-6">
      <div></div>

      <push-button
        variant="primary"
        :route="route('organizations.create')"
      >
        <span>Create</span>
        <span class="hidden md:inline">&nbsp;Organization</span>
      </push-button>
    </div>

    <card :padded="false">
      <navigare-deferred :value="organizations">
        <template #fallback>
          <div class="flex items-center justify-center my-8">
            <activity-indicator class="h-16 w-16" />
          </div>
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
              v-for="organization in organizations.data"
              :key="organization.id"
              class="hover:bg-gray-100 focus-within:bg-gray-100"
            >
              <td class="border-t">
                <navigare-link
                  class="flex items-center px-6 py-4 focus:text-indigo-500"
                  :route="
                    route('organizations.edit', {
                      organization,
                    })
                  "
                >
                  {{ organization.name }}

                  <icon
                    v-if="organization.deleted_at"
                    name="trash"
                    class="flex-shrink-0 ml-2 w-3 h-3 fill-gray-400"
                  />
                </navigare-link>
              </td>
              <td class="border-t">
                <navigare-link
                  class="flex items-center px-6 py-4"
                  :route="
                    route('organizations.edit', {
                      organization,
                    })
                  "
                  tabindex="-1"
                >
                  {{ organization.city }}
                </navigare-link>
              </td>
              <td class="border-t">
                <navigare-link
                  class="flex items-center px-6 py-4"
                  :route="
                    route('organizations.edit', {
                      organization,
                    })
                  "
                  tabindex="-1"
                >
                  {{ organization.phone }}
                </navigare-link>
              </td>
              <td class="w-px border-t">
                <navigare-link
                  class="flex items-center px-4"
                  :route="
                    route('organizations.edit', {
                      organization,
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
            <tr v-if="organizations.data.length === 0">
              <td
                class="px-6 py-4 border-t"
                colspan="4"
              >
                No organizations found.
              </td>
            </tr>
          </tbody>
        </table>

        <pagination
          class="mt-6"
          :links="organizations.links"
        />
      </navigare-deferred>
    </card>
  </div>
</template>

<script lang="ts" setup>
import ActivityIndicator from '../../components/ActivityIndicator.vue'
import Breadcrumbs from '../../components/Breadcrumbs.vue'
import Card from '../../components/Card.vue'
import Icon from '../../components/Icon.vue'
import PageTitle from '../../components/PageTitle.vue'
import Pagination from '../../components/Pagination.vue'
import PushButton from '../../components/PushButton.vue'
import { DeferredProperty } from '@navigare/core'
import { NavigareLink, NavigareDeferred } from '@navigare/vue3'
import { PropType } from 'vue'

defineProps({
  filters: Object,

  organizations: {
    type: Object as PropType<DeferredProperty>,
  },
})
</script>
