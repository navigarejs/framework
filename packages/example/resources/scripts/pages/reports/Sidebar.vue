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
import { useFragment } from '@navigare/vue3'
import { ref } from 'vue'

const items = ref([
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
])

const id = new Date()

const fragment = useFragment()
const defaultFragment = useFragment('default')

fragment.exposed.shuffle = () => {
  items.value = items.value
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value)
}
</script>
