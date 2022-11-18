<template>
  <div>Hello World</div>
  <div>{{ $route('welcome') }}</div>
  <div>{{ rawRoute }}</div>
</template>

<script lang="ts" setup>
import { route } from '@navigare/core'

const rawRoute = route('welcome' as never)
</script>
