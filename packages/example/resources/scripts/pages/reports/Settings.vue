<template>
  <div>
    <page-title />
  </div>
</template>

<script lang="ts" setup>
import PageTitle from '../../components/PageTitle.vue'
import { useRouter } from '@navigare/vue3'

defineProps({})

const router = useRouter()
</script>
