<template>
  <div class="flex flex-row space-x-2 h-6">
    <div
      v-for="(breadcrumb, index) in breadcrumbs.path"
      class="flex flex-row space-x-2"
    >
      <navigare-link
        :route="breadcrumb.url"
        class="text-gray-500"
      >
        {{ breadcrumb.title }}
      </navigare-link>

      <div class="text-gray-300">/</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import useBreadcrumbs from '../compositions/useBreadcrumbs'
import { NavigareLink } from '@navigare/vue3'

const breadcrumbs = useBreadcrumbs()
</script>
