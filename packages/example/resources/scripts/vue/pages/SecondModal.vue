<template>
  <div class="absolute inset-0 flex items-center justify-center">
    <div
      class="relative bg-white rounded-lg p-4 w-full min-w-[30%] max-w-[80%] m-4"
    >
      <button
        class="absolute top-2 right-2 !border-0 !rounded-full !p-2 !m-0"
        @click="
          router.back(
            route('vue.home', {
              name,
            }),
          )
        "
      >
        <svg
          class="h-6 w-6"
          x-description="Heroicon name: outline/x-mark"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M6 18L18 6M6 6l12 12"
          ></path>
        </svg>
      </button>

      <div>
        This is a second modal which can be even on top of the previous one.
      </div>

      <div class="mt-8 flex flex-row space-x-4">
        <navigare-link
          as="button"
          :route="
            route('vue.home', {
              name,
            })
          "
          >Go to Home</navigare-link
        >

        <navigare-link
          as="button"
          :route="route('vue.nested.index')"
          >Go to Nested</navigare-link
        >
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useRouter, NavigareLink } from '@navigare/vue3'

defineProps({
  name: String,
})

const router = useRouter()
</script>
