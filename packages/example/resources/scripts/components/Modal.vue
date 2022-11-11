<template>
  <div
    class="absolute inset-0 flex items-center justify-center transition-all duration-500"
  >
    <div
      class="rounded bg-white shadow w-[500px] max-w-[80%] relative"
      :class="{
        'p-4': padded,
      }"
    >
      <button
        class="absolute top-2 right-2 !border-0 !rounded-full !p-2 !m-0"
        @click="router.back(parentUrl)"
      >
        <icon
          name="close"
          class="h-8 w-8 text-gray-500"
        />
      </button>

      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
import Icon from './Icon.vue'
import { useRouter } from '@navigare/vue3'

defineProps({
  padded: {
    type: Boolean,
    default: () => true,
  },

  parentUrl: String,
})

const router = useRouter()
</script>
