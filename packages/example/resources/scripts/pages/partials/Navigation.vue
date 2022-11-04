<template>
  <div>
    <ul class="space-y-2">
      <li v-for="id in [1, 2, 3, 4, 5, 6]">
        <navigare-link
          :route="
            route('nested.details', {
              id,
            })
          "
          class="block rounded relative select-none py-2 pl-3 pr-9 text-gray-900 hover:text-white hover:bg-indigo-600"
          active-class="text-white bg-indigo-600"
        >
          Nested page #{{ id }}
        </navigare-link>
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import { NavigareLink } from '@navigare/vue3'
</script>
