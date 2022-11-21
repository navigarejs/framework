<template>
  <div class="flex flex-col space-y-2">
    <push-button
      v-for="(item, index) in items"
      :key="index"
      :route="
        $route('reports.show', {
          name: item.label,
        })
      "
      variant="secondary"
    >
      {{ item.label }}
    </push-button>
  </div>
</template>

<script lang="ts" setup>
import PushButton from '../../components/PushButton.vue'

const items = [
  {
    label: 'Sales Funnel',
  },
  {
    label: 'Pipeline Development',
  },
  {
    label: 'Stage Distribution',
  },
  {
    label: 'Total Sales',
  },
]
</script>
