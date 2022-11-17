<template>
  <div>
    <breadcrumbs />

    <page-title />

    <div class="flex items-center justify-between mb-6">
      <div></div>

      <push-button
        variant="primary"
        :route="route('users.create')"
      >
        <span>Create</span>
        <span class="hidden md:inline">&nbsp;User</span>
      </push-button>
    </div>

    <card :padded="false">
      <table class="w-full whitespace-nowrap">
        <thead>
          <tr class="text-left font-bold">
            <th class="pb-4 pt-6 pl-6 w-8"></th>
            <th class="pb-4 pt-6 px-6">Name</th>
            <th class="pb-4 pt-6 px-6">Email</th>
            <th
              class="pb-4 pt-6 px-6"
              colspan="2"
            >
              Role
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="user in users"
            :key="user.id"
            class="hover:bg-gray-100 focus-within:bg-gray-100"
          >
            <td class="border-t">
              <navigare-link
                class="flex items-center pl-6 focus:text-indigo-500"
                :route="
                  route('users.edit', {
                    user,
                  })
                "
              >
                <div
                  class="w-10 h-10 rounded-full overflow-hidden bg-gray-100 bg-cover"
                  :style="{
                    backgroundImage: user.photo ? `url(${user.photo})` : '',
                  }"
                ></div>
              </navigare-link>
            </td>
            <td class="border-t">
              <navigare-link
                class="flex items-center px-6 py-4 focus:text-indigo-500"
                :route="
                  route('users.edit', {
                    user,
                  })
                "
              >
                {{ user.name }}

                <icon
                  v-if="user.deleted_at"
                  name="trash"
                  class="flex-shrink-0 ml-2 w-3 h-3 fill-gray-400"
                />
              </navigare-link>
            </td>
            <td class="border-t">
              <navigare-link
                class="flex items-center px-6 py-4"
                :route="
                  route('users.edit', {
                    user,
                  })
                "
                tabindex="-1"
              >
                {{ user.email }}
              </navigare-link>
            </td>
            <td class="border-t">
              <navigare-link
                class="flex items-center px-6 py-4"
                :href="`/users/${user.id}/edit`"
                tabindex="-1"
              >
                {{ user.owner ? 'Owner' : 'User' }}
              </navigare-link>
            </td>
            <td class="w-px border-t">
              <navigare-link
                class="flex items-center px-4"
                :route="
                  route('users.edit', {
                    user,
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
          <tr v-if="users.length === 0">
            <td
              class="px-6 py-4 border-t"
              colspan="4"
            >
              No users found.
            </td>
          </tr>
        </tbody>
      </table>
    </card>
  </div>
</template>

<script lang="ts" setup>
import Breadcrumbs from '../../components/Breadcrumbs.vue'
import Card from '../../components/Card.vue'
import Icon from '../../components/Icon.vue'
import PageTitle from '../../components/PageTitle.vue'
import PushButton from '../../components/PushButton.vue'
import { route } from '@navigare/core'
import { NavigareLink } from '@navigare/vue3'

defineProps({
  filters: Object,
  users: Array,
})
</script>
