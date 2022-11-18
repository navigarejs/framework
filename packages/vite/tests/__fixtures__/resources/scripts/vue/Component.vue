<template>
  <div>Hello World</div>
  <div>{{ rawRoute }}</div>
  <div>{{ $route('welcome') }}</div>
</template>

<script lang="ts">
import { route } from '@navigare/core'
import { defineComponent } from 'vue'

export default defineComponent({
  setup() {
    const rawRoute = route('welcome' as never)

    return {
      rawRoute,
    }
  },
})
</script>
