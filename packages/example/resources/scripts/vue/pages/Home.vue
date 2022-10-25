<template>
  <div>
    <navigare-head>
      <title>Home</title>
    </navigare-head>

    <div class="shadow bg-white p-4">
      <div>{{ greeting }} {{ name }}!</div>

      <br />

      <div class="space-x-2 flex flex-row">
        <navigare-link
          as="button"
          :route="router.route"
          >Refresh</navigare-link
        >

        <navigare-link
          as="button"
          :route="router.route"
          :props="['header/time']"
          >Refresh time in header only</navigare-link
        >

        <navigare-link
          as="button"
          :route="
            route('vue.nested.details', {
              id: 5,
            })
          "
          >Navigate to subpage in Nested</navigare-link
        >

        <navigare-link
          as="button"
          :route="route('vue.redirect')"
          >Navigate to Long via redirect</navigare-link
        >

        <br />

        <navigare-link
          as="button"
          :route="
            route('vue.modal', {
              name,
            })
          "
          >Open modal</navigare-link
        >
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { route } from '@navigare/core'
import { NavigareLink, useRouter, NavigareHead } from '@navigare/vue3'

defineProps({
  greeting: String,
  name: String,
})

const router = useRouter()
</script>
