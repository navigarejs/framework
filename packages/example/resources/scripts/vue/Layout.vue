<template>
  <div class="bg-gray-50 min-h-screen">
    <div class="fixed top-0 left-0 right-0 h-12 bg-gray-800 text-gray-300 px-4">
      <page-fragments name="header" />
    </div>

    <div class="mt-12 px-4 py-4 flex flex-row space-x-4">
      <transition name="slide-fade">
        <div
          v-if="layout === 'nested'"
          class="w-full max-w-[300px]"
        >
          <page-fragments name="navigation" />
        </div>
      </transition>

      <div class="w-full">
        <page-fragments
          name="default"
          #fragment="{ component }"
        >
          <transition
            name="fade"
            mode="out-in"
          >
            <component :is="component" />
          </transition>
        </page-fragments>
      </div>
    </div>

    <div>
      {{ router.location }}
    </div>

    <page-fragments
      name="modal"
      #default="{ fragments }"
    >
      <div
        class="absolute inset-0 flex items-center justify-center overflow-hidden transition-all"
        :class="{
          'pointer-events-none': fragments.length === 0,
          'bg-black/50': fragments.length > 0,
        }"
      >
        <transition-group name="slide-bottom">
          <template
            v-for="(fragment, index) in fragments"
            :key="index"
          >
            <component
              :is="fragment"
              :class="{
                'scale-75': index < fragments.length - 1,
              }"
            />
          </template>
        </transition-group>
      </div>
    </page-fragments>
  </div>
</template>

<script lang="ts" setup>
import { useRouter, PageFragments } from '@navigare/vue3'
import { ssrContextKey } from 'vue'

defineProps({
  layout: String,
})

const router = useRouter()

const a = ssrContextKey
</script>

<style>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 500ms linear;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  width: 0px;
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 500ms linear;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-bottom-enter-active,
.slide-bottom-leave-active {
  transition: all 500ms linear;
}

.slide-bottom-enter-from,
.slide-bottom-leave-to {
  opacity: 0;
  margin-top: 100%;
  height: 300%;
}
</style>
