<template>
  <navigare-input
    :name="name"
    #default="{ attributes, value, events }"
  >
    <div v-bind="attributes">
      <input
        ref="input"
        type="file"
        :accept="accept"
        class="hidden"
        @change="(event) => handleChange(event, value)"
      />

      <div v-if="!value.value">
        <push-button
          type="button"
          @click="handleBrowse"
        >
          Browse
        </push-button>
      </div>

      <div
        v-else
        class="flex items-center justify-between"
      >
        <div class="flex-1 pr-1">
          <template v-if="$slots.default">
            <slot
              v-bind="{
                value: value.value,
                temporaryUrl,
                size,
                readableSize,
              }"
            />
          </template>

          <template v-else>
            {{ value.value.name }}
            <span
              v-if="value.value.size"
              class="text-gray-500 text-xs"
              >({{ readableSize }})</span
            >
          </template>
        </div>

        <push-button
          type="button"
          @click="() => (value.value = null)"
        >
          Remove
        </push-button>
      </div>
    </div>
  </navigare-input>
</template>

<script lang="ts" setup>
import PushButton from './PushButton.vue'
import { NavigareInput } from '@navigare/vue3'
import { computed, Ref, ref } from 'vue'

defineProps({
  name: {
    type: String,
    required: true,
  },

  accept: String,
})

const input = ref<HTMLInputElement>()
const file = ref<File | undefined>(undefined)
const temporaryUrl = computed(() => {
  if (!file.value) {
    return null
  }

  return URL.createObjectURL(file.value)
})
const size = computed(() => {
  return file.value?.size
})
const readableSize = computed(() => {
  if (!file.value) {
    return 0
  }

  const rank = Math.floor(Math.log(size.value) / Math.log(1024))
  const readableSize = Number((size.value / Math.pow(1024, rank)).toFixed(2))

  return `${readableSize} ${['B', 'kB', 'MB', 'GB', 'TB'][rank]}`
})

// Create handlers
const handleBrowse = () => {
  input.value?.click()
}
const handleChange = (event: Event, value: Ref<any>) => {
  if (
    !(event.target instanceof HTMLInputElement) ||
    event.target.type !== 'file'
  ) {
    return
  }

  file.value = event.target.files?.[0]
  value.value = file.value
}
</script>
