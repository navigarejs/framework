<template>
  <div>Hello World</div>
  <div>{{ rawRoute }}</div>
  <div>{{ route('welcome') }}</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { route } from '@navigare/core'

export default defineComponent({
  setup() {
    const rawRoute = route('welcome' as never)

    return {
      rawRoute,
    }
  },
})
</script>
