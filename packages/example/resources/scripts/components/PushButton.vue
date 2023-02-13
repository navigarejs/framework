<template>
  <navigare-link
    :as="!route ? 'button' : undefined"
    :route="route"
    :disabled="disabled || processing || undefined"
    class="h-10 group relative flex items-center justify-center rounded-md border border-transparent py-2 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300"
    :class="{
      'opacity-50': disabled || processing,
      'bg-indigo-600 text-white hover:bg-indigo-700': variant === 'primary',
      'bg-red-600 text-white hover:bg-red-700': variant === 'danger',
      'bg-gray-200 text-gray-800 hover:bg-gray-300': variant === 'secondary',
      'bg-gray-50 text-gray-800 hover:bg-gray-100': !variant,
      'text-gray-600': !variant,
      'pl-10': (processing || !!$slots.icon) && !!$slots.default,
    }"
    :active="active"
    :active-class="{
      'bg-indigo-800': variant === 'primary',
      'bg-red-800': variant === 'danger',
      'bg-gray-300': variant === 'secondary',
      'bg-gray-200': !variant,
    }"
    :inactive-class="inactiveClass"
    :pending-class="pendingClass"
  >
    <transition name="fade">
      <div
        class="absolute inset-y-0 left-0 flex items-center"
        :class="{
          'pl-3': !!$slots.default,
        }"
      >
        <div
          v-if="processing"
          class="w-8 h-8"
        >
          <activity-indicator />
        </div>

        <slot name="icon" />
      </div>
    </transition>

    <slot />
  </navigare-link>
</template>

<script lang="ts" setup>
import ActivityIndicator from './ActivityIndicator.vue'
import { getRoutePropType, NavigareLink } from '@navigare/vue3'
import { PropType } from 'vue'

defineProps({
  disabled: Boolean,

  processing: Boolean,

  variant: String as PropType<'primary' | 'danger' | 'secondary'>,

  route: {
    type: getRoutePropType(),
  },

  active: Boolean,

  activeClass: [String, Array, Object],

  inactiveClass: [String, Array, Object],

  pendingClass: [String, Array, Object],
})
</script>
