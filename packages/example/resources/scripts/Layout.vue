<template>
  <div class="relative bg-gray-100 min-h-screen">
    <template v-if="layout === 'unauthenticated'">
      <unauthenticated />
    </template>

    <template v-else>
      <div
        class="fixed z-50 top-0 left-0 right-0 h-12 bg-gray-800 text-gray-300 px-4"
      >
        <navigare-fragments name="header" />
      </div>

      <div class="mt-12 px-4 py-4 flex flex-col">
        <transition name="slide-fade">
          <div v-if="router.fragments.hero">
            <navigare-fragments name="hero" />
          </div>
        </transition>

        <div class="flex flex-row space-x-4">
          <transition name="slide-fade">
            <div
              v-if="router.fragments.left"
              class="w-full max-w-[300px]"
            >
              <navigare-fragments name="left" />
            </div>
          </transition>

          <div class="w-full">
            <navigare-fragments
              name="default"
              #default="{ fragment }"
            >
              <transition
                name="fade"
                mode="out-in"
              >
                <div :key="fragment.component.key">
                  <component :is="fragment.component" />
                </div>
              </transition>
            </navigare-fragments>
          </div>
        </div>
      </div>

      <navigare-fragments
        name="modal"
        #default="{ fragments }"
      >
        <div
          class="fixed inset-0 flex items-center justify-center overflow-hidden transition-all"
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
              <modal
                :parent-url="
                  fragment.page.properties.breadcrumbs[
                    fragment.page.properties.breadcrumbs.length - 2
                  ]?.url
                "
                :class="{
                  'scale-75 opacity-25': index < fragments.length - 1,
                }"
              >
                <component :is="fragment.component"
              /></modal>
            </template>
          </transition-group>
        </div>
      </navigare-fragments>
    </template>

    <div
      class="fixed inset-0 bottom-4 z-1000 pointer-events-none flex items-end justify-center"
    >
      <div class="grid items-center justify-end gap-2">
        <output
          v-for="message in messages"
          :key="message.id"
          role="status"
          class="message p-2 rounded"
          :class="{
            'bg-red-200': message.type === 'error',
            'bg-indigo-200': message.type === 'success',
          }"
        >
          {{ message.text }}
        </output>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Modal from './components/Modal.vue'
import Unauthenticated from './pages/Unauthenticated.vue'
import { useRouter, usePage, NavigareFragments } from '@navigare/vue3'
import { lock, unlock } from 'tua-body-scroll-lock'
import { ref, watch } from 'vue'

defineProps({
  layout: String,
})

const router = useRouter()
const page = usePage()

// Toggle body scroll when modals are open
watch(
  () => {
    return router.fragments.modal
  },
  (nextModals) => {
    const shouldLock = Array.isArray(nextModals)
      ? nextModals.length > 0
      : !!nextModals

    if (shouldLock) {
      lock(null)
    } else {
      unlock(null)
    }
  },
  {
    immediate: true,
  },
)

// Watch flash messages
const messages = ref<
  {
    id: string
    type: 'success' | 'error'
    text: string
  }[]
>([])
watch(
  () => page.properties.flash,
  ({ success: nextSuccess, error: nextError }) => {
    if (nextSuccess) {
      messages.value.push({
        id: Math.random().toString(),
        type: 'success',
        text: nextSuccess,
      })
    }

    if (nextError) {
      messages.value.push({
        id: Math.random().toString(),
        type: 'error',
        text: nextError,
      })
    }
  },
  {
    deep: true,
  },
)
</script>

<style>
.message {
  --duration: 2s;
  --travel-distance: 0;

  transform-origin: bottom;
  will-change: transform;
  animation: fade-in 0.3s ease, slide-in 0.3s ease,
    fade-out 0.3s ease var(--duration) 1 forwards;
}

@media (prefers-reduced-motion: no-preference) {
  .message {
    --travel-distance: 5vh;
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
}

@keyframes fade-out {
  to {
    opacity: 0;
  }
}

@keyframes slide-in {
  from {
    transform: translateY(var(--travel-distance));
  }
}
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 200ms linear;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  width: 0px;
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 200ms linear;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-bottom-enter-active,
.slide-bottom-leave-active {
  transition: all 200ms ease-out;

  & > div {
    transition: all 200ms ease-out;
  }
}

.slide-bottom-enter-from,
.slide-bottom-leave-to {
  opacity: 0;

  & > div {
    transform: translateY(20%);
  }
}
</style>
