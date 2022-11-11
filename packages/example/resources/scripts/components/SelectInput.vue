<template>
  <navigare-input
    :name="name"
    #default="{ ref, attributes, events, value }"
  >
    <select
      v-bind="{
        ref,
        ...attributes,
        ...events,
      }"
      v-model="value.value"
    >
      <slot />
    </select>
  </navigare-input>
</template>

<script lang="ts" setup>
import { NavigareInput } from '@navigare/vue3'

defineProps({
  name: {
    type: String,
    required: true,
  },
})
</script>
