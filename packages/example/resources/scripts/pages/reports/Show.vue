<template>
  <div>
    <card :title="breadcrumbs.title">
      <p>
        This page could have some nice graphs but I was too lazy to create some
        samples - sorry ✌️
      </p>

      <p>
        However, I can show you how you can expose information on one fragment
        and consume it in the other:
      </p>

      <push-button @click="leftFragment.exposed?.shuffle()">
        Shuffle list
      </push-button>
    </card>
  </div>
</template>

<script lang="ts" setup>
import Card from '../../components/Card.vue'
import PushButton from '../../components/PushButton.vue'
import useBreadcrumbs from '../../compositions/useBreadcrumbs'
import { useFragment } from '@navigare/vue3'

const breadcrumbs = useBreadcrumbs()

const fragment = useFragment()
const leftFragment = useFragment('left')

fragment.exposed.counter = 0
setInterval(() => {
  fragment.exposed.counter++
}, 500)
</script>
