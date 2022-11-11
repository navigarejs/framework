<template>
  <div>
    <card :title="breadcrumbs.title">
      <p>
        This page could have some nice graphs but I was too lazy to create some
        samples - sorry ✌️
      </p>
    </card>
  </div>
</template>

<script lang="ts" setup>
import Card from '../../components/Card.vue'
import useBreadcrumbs from '../../compositions/useBreadcrumbs'

const breadcrumbs = useBreadcrumbs()
</script>
