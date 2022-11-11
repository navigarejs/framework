import { PageProperties } from '@navigare/core'
import { usePageFragment } from '@navigare/vue3'
import { computed, ComputedRef, reactive } from 'vue'

export default function useBreadcrumbs() {
  const pageFragment = usePageFragment()
  const breadcrumbs = computed(() => {
    return pageFragment.properties.breadcrumbs
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
