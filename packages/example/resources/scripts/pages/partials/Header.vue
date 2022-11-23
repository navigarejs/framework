<template>
  <div class="h-full flex items-center justify-between">
    <div class="flex flex-row">
      <img
        class="mx-auto h-8 w-auto mr-4"
        src="https://raw.githubusercontent.com/navigarejs/framework/main/assets/logo.svg"
        alt="Navigare"
      />

      <ul class="flex items-center space-x-2">
        <li v-for="{ label, route } in links">
          <navigare-link
            class="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
            active-class="bg-gray-900 text-white px-3 py-2 rounded-md text-sm font-medium"
            :route="route"
            >{{ label }}</navigare-link
          >
        </li>
      </ul>
    </div>

    <div class="flex flex-row items-center space-x-2">
      <div class="w-12">
        <transition name="fade">
          <activity-indicator
            v-if="router.processing"
            class="h-12 w-12"
          />
        </transition>
      </div>

      <div class="flex items-center">
        <input
          name="remember"
          type="checkbox"
          v-model="slow"
          class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />

        <label class="ml-2 block text-sm text-white">Slow</label>
      </div>

      <div class="flex flex-row space-x-2">
        <navigare-link
          :route="
            $route('users.edit', {
              user: router.page.properties.user,
            })
          "
          class="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
          active-class="bg-gray-900 text-white px-3 py-2 rounded-md text-sm font-medium"
        >
          <icon
            name="user"
            class="w-6 h-6"
          />
        </navigare-link>

        <navigare-link
          :route="$route('auth.logout')"
          class="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
          active-class="bg-gray-900 text-white px-3 py-2 rounded-md text-sm font-medium"
        >
          <icon
            name="logout"
            class="w-6 h-6"
          />
        </navigare-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import ActivityIndicator from '../../components/ActivityIndicator.vue'
import Icon from '../../components/Icon.vue'
import { PartialRoute, Routable, route } from '@navigare/core'
import { NavigareLink, useFragment, useRouter } from '@navigare/vue3'
import { ref } from 'vue'

defineProps({
  time: String,
})

const router = useRouter()
const fragment = useFragment()

const slow = ref(false)

// Send "X-Slow" header to fake slow responses
router.on('before', (event) => {
  event.detail.visit.headers['X-Slow'] = String(slow.value)
})

// Links
const links: {
  label: string
  route: Routable | [Routable, ...(PartialRoute | string)[]]
}[] = [
  {
    label: 'Home',
    route: [route('dashboard.index')],
  },
  {
    label: 'Organizations',
    route: [route('organizations.index'), 'organizations.*'],
  },
  {
    label: 'Contacts',
    route: [route('contacts.index'), 'contacts.*'],
  },
  {
    label: 'Reports',
    route: [route('reports.index'), 'reports.*'],
  },
  {
    label: 'Users',
    route: [route('users.index'), 'users.*'],
  },
]
</script>
