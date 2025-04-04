// stores/filterStore.js - Assuming this file exists, here's how it should handle state

import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useFilterStore = defineStore('filter', () => {
  const selectedCategoryIds = ref([])
  const priceMin = ref('')
  const priceMax = ref('')
  const distanceKm = ref('')
  const latitude = ref(null)
  const longitude = ref(null)

  // Set all filters at once
  function setFilters(filters) {
    if (filters.categoryIds) {
      // Ensure they're numbers
      selectedCategoryIds.value = Array.isArray(filters.categoryIds) 
        ? filters.categoryIds.map(id => typeof id === 'string' ? parseInt(id, 10) : id)
        : []
    }
    
    priceMin.value = filters.priceMin !== undefined ? filters.priceMin : ''
    priceMax.value = filters.priceMax !== undefined ? filters.priceMax : ''
    distanceKm.value = filters.distanceKm !== undefined ? filters.distanceKm : ''
    latitude.value = filters.latitude !== undefined ? filters.latitude : null
    longitude.value = filters.longitude !== undefined ? filters.longitude : null
  }

  return {
    selectedCategoryIds,
    priceMin,
    priceMax,
    distanceKm,
    latitude,
    longitude,
    setFilters
  }
})