<template>
  <div class="h-full flex items-center justify-between">
    <div>
      <ul class="flex items-center space-x-2">
        <li>
          <navigare-link
            class="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
            active-class="bg-gray-900 text-white px-3 py-2 rounded-md text-sm font-medium"
            :route="[route('vue.home')]"
            >Home</navigare-link
          >
        </li>

        <li>
          <navigare-link
            class="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
            active-class="bg-gray-900 text-white px-3 py-2 rounded-md text-sm font-medium"
            :route="[route('vue.nested.index'), 'vue.nested.*']"
            >Nested</navigare-link
          >
        </li>

        <li>
          <navigare-link
            class="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
            active-class="bg-gray-900 text-white px-3 py-2 rounded-md text-sm font-medium"
            :route="[route('vue.long')]"
            >Long page</navigare-link
          >
        </li>

        <li>
          <navigare-link
            class="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
            active-class="bg-gray-900 text-white px-3 py-2 rounded-md text-sm font-medium"
            :route="[route('vue.form')]"
            >Form</navigare-link
          >
        </li>
      </ul>
    </div>

    <div class="flex flex-row items-center space-x-2">
      <div>{{ time }}</div>

      <div class="w-12">
        <transition name="fade">
          <svg
            v-if="router.processing"
            version="1.1"
            id="L9"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
            viewBox="0 0 100 100"
            enable-background="new 0 0 0 0"
            xml:space="preserve"
          >
            <path
              fill="#fff"
              d="M73,50c0-12.7-10.3-23-23-23S27,37.3,27,50 M30.9,50c0-10.5,8.5-19.1,19.1-19.1S69.1,39.5,69.1,50"
            >
              <animateTransform
                attributeName="transform"
                attributeType="XML"
                type="rotate"
                dur="1s"
                from="0 50 50"
                to="360 50 50"
                repeatCount="indefinite"
              />
            </path>
          </svg>
        </transition>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { NavigareLink, useRouter } from '@navigare/vue3'

const props = defineProps({
  time: String,
})

const router = useRouter()
</script>
