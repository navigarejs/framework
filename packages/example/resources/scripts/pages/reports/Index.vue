<template>
  <div>
    <card>
      <p>Select a report on the left.</p>
    </card>
  </div>
</template>

<script lang="ts" setup>
import Card from '../../components/Card.vue'

defineProps({})

throw new Error(
  'Exceptions are caught in the fragment and do not affect the whole page.',
)
</script>
