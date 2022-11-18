import { useFragment } from '@navigare/vue3'
import { computed, reactive } from 'vue'

export default function useBreadcrumbs() {
  const fragment = useFragment()
  const breadcrumbs = computed(() => {
    return fragment.properties.breadcrumbs
  })
  const path = computed(() => {
    return [...breadcrumbs.value].slice(0, breadcrumbs.value.length - 1)
  })
  const lastBreadcrumb = computed(() => {
    return breadcrumbs.value[breadcrumbs.value.length - 1]
  })
  const parent = computed(() => {
    return breadcrumbs.value[breadcrumbs.value.length - 2]
  })
  const title = computed(() => {
    return lastBreadcrumb.value?.title
  })

  return reactive({
    path,
    title,
    parent,
  })
}
