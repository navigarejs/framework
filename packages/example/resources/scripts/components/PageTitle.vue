<template>
  <headline>
    {{ breadcrumbs.title }}
  </headline>

  <navigare-head>
    <title>{{ breadcrumbs.title }}</title>
  </navigare-head>
</template>

<script lang="ts" setup>
import useBreadcrumbs from '../compositions/useBreadcrumbs'
import Headline from './Headline.vue'
import { NavigareHead } from '@navigare/vue3'

const breadcrumbs = useBreadcrumbs()
</script>
