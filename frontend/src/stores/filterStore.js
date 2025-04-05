import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useFilterStore = defineStore('filter', () => {
  const selectedCategoryIds = ref([])
  const priceMin = ref('')
  const priceMax = ref('')
  const distanceKm = ref('')
  const latitude = ref(null)
  const longitude = ref(null)

  function setFilters(filters = {}) {
    selectedCategoryIds.value = Array.isArray(filters.categoryIds)
      ? filters.categoryIds.map(id => Number(id))
      : []
    priceMin.value = filters.priceMin ?? ''
    priceMax.value = filters.priceMax ?? ''
    distanceKm.value = filters.distanceKm ?? ''
    latitude.value = filters.latitude ?? null
    longitude.value = filters.longitude ?? null
  }

  function buildFiltersQuery(baseQuery = {}) {
    const query = { ...baseQuery }

    // Categories
    if (selectedCategoryIds.value.length) {
      query.categoryIds = selectedCategoryIds.value.map(id => String(id))
    } else {
      delete query.categoryIds
    }

    // Price min
    if (priceMin.value !== '') {
      query.minPrice = priceMin.value
    } else {
      delete query.minPrice
    }

    // Price max
    if (priceMax.value !== '') {
      query.maxPrice = priceMax.value
    } else {
      delete query.maxPrice
    }

    // Distance
    if (distanceKm.value !== '') {
      query.distanceKm = distanceKm.value
    } else {
      delete query.distanceKm
    }

    // Latitude
    if (latitude.value !== null) {
      query.latitude = latitude.value
    } else {
      delete query.latitude
    }

    // Longitude
    if (longitude.value !== null) {
      query.longitude = longitude.value
    } else {
      delete query.longitude
    }

    return query
  }

  return {
    selectedCategoryIds,
    priceMin,
    priceMax,
    distanceKm,
    latitude,
    longitude,
    setFilters,
    buildFiltersQuery
  }
})
