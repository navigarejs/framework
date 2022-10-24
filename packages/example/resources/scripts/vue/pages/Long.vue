<template>
  <div class="shadow bg-white p-4 space-y-4">
    <p
      v-for="index in Array(20)"
      :key="index"
    >
      Lorem Ipsum is simply dummy text of the printing and typesetting industry.
      Lorem Ipsum has been the industry's standard dummy text ever since the
      1500s, when an unknown printer took a galley of type and scrambled it to
      make a type specimen book. It has survived not only five centuries, but
      also the leap into electronic typesetting, remaining essentially
      unchanged. It was popularised in the 1960s with the release of Letraset
      sheets containing Lorem Ipsum passages, and more recently with desktop
      publishing software like Aldus PageMaker including versions of Lorem
      Ipsum.
    </p>

    <div class="space-x-2 flex flex-row">
      <navigare-link
        as="button"
        :route="route('vue.home')"
        >Navigate to Home but preserve scroll when you click back</navigare-link
      >
    </div>
  </div>
</template>

<script lang="ts" setup>
import { NavigareLink } from '@navigare/vue3'
</script>
