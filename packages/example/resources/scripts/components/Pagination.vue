<template>
  <div v-if="links.length > 3">
    <div class="flex flex-wrap -mb-1 justify-center">
      <template
        v-for="(link, key) in links"
        :key="key"
      >
        <div
          v-if="link.url === null"
          class="block mb-1 mr-1 px-4 py-3 text-gray-400 text-sm leading-4 border rounded"
          v-html="link.label"
        />

        <navigare-link
          v-else
          class="mb-1 mr-1 px-4 py-3 focus:text-indigo-500 text-sm leading-4 hover:bg-white focus:border-indigo-500 rounded border-2"
          active-class="border-indigo-500 bg-indigo-50 font-bold"
          inactive-class=""
          :route="link.url"
          v-html="link.label"
          :active="link.active"
        />
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { NavigareLink } from '@navigare/vue3'
import { PropType } from 'vue'

defineProps({
  links: Array as PropType<
    {
      url: string
      label: string
      active?: boolean
    }[]
  >,
})
</script>
