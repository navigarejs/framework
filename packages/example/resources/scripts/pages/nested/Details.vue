<template>
  <div class="shadow bg-white p-4">
    <h2 class="text-2xl font-bold tracking-tight text-gray-900">
      Nested Page #{{ router.parameters.id }}
    </h2>

    {{ router.parameters }}
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from '@navigare/vue3'

const router = useRouter()
</script>
