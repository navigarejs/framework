<template>
  <div
    class="rounded bg-white shadow"
    :class="{
      'p-4': padded,
    }"
  >
    <div
      v-if="title || $slots.actions"
      class="flex flex-row justify-between"
      :class="{
        'p-4': !padded,
      }"
    >
      <div class="flex items-center">
        <div
          v-if="title"
          class="text-2xl"
        >
          {{ title }}
        </div>
      </div>

      <div class="flex items-center">
        <slot name="actions" />
      </div>
    </div>

    <slot />
  </div>
</template>

<script lang="ts" setup>
defineProps({
  title: String,

  padded: {
    type: Boolean,
    default: () => true,
  },
})
</script>
