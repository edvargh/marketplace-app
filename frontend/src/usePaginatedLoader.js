import { ref } from 'vue'

export function usePaginatedLoader(fetchFn, pageSize = 6) {
  const items = ref([])
  const page = ref(0)
  const loadingInitial = ref(true)
  const loadingMore = ref(false)
  const error = ref(null)
  const moreAvailable = ref(true)

  const loadMore = async () => {
    const isInitialLoad = page.value === 0
    if (isInitialLoad) loadingInitial.value = true
    else loadingMore.value = true

    try {
      const result = await fetchFn(page.value, pageSize)
      if (result.length < pageSize) {
        moreAvailable.value = false
      }
      items.value.push(...result)
      page.value++
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      if (isInitialLoad) loadingInitial.value = false
      else loadingMore.value = false
    }
  }

  return {
    items,
    page,
    loadMore,
    loadingInitial,
    loadingMore,
    moreAvailable,
    error
  }
}
