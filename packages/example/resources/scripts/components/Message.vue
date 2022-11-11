<template>
  <div
    v-if="visible"
    class="flex flex-row justify-between my-4 p-2 rounded"
    :class="{
      'bg-orange-100': variant === 'warning',
    }"
  >
    <div class="flex items-center space-x-2">
      <div
        v-if="$slots.icon"
        class="text-gray-700"
      >
        <slot name="icon" />
      </div>

      <div><slot /></div>
    </div>

    <div v-if="$slots.action">
      <slot name="action" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { PropType } from 'vue'

defineProps({
  visible: Boolean,
  variant: String as PropType<'warning'>,
})
</script>
