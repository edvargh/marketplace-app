import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useFilterStore = defineStore('filterStore', () => {
  const selectedCategoryIds = ref([])
  const priceMin = ref('')
  const priceMax = ref('')
  const distanceKm = ref('')
  const latitude = ref(null)
  const longitude = ref(null)
  
  const setFilters = (filters) => {
    // Ensure categories are always numbers and handle all formats
    if (filters.categories) {
      if (Array.isArray(filters.categories)) {
        // Handle array input
        selectedCategoryIds.value = filters.categories.map(id => 
          typeof id === 'string' ? parseInt(id, 10) : id
        )
      } else if (typeof filters.categories === 'string') {
        // Handle comma-separated string
        selectedCategoryIds.value = filters.categories
          .split(',')
          .map(id => parseInt(id.trim(), 10))
          .filter(id => !isNaN(id))
      } else {
        // Reset if invalid format
        selectedCategoryIds.value = []
      }
    } else {
      // Reset if no categories
      selectedCategoryIds.value = []
    }
    
    priceMin.value = filters.priceMin !== undefined ? filters.priceMin : ''
    priceMax.value = filters.priceMax !== undefined ? filters.priceMax : ''
    distanceKm.value = filters.distanceKm !== undefined ? filters.distanceKm : ''
    latitude.value = filters.latitude !== undefined ? filters.latitude : null
    longitude.value = filters.longitude !== undefined ? filters.longitude : null
  }
  
  const resetFilters = () => {
    selectedCategoryIds.value = []
    priceMin.value = ''
    priceMax.value = ''
    distanceKm.value = ''
    latitude.value = null
    longitude.value = null
  }
  
  return {
    selectedCategoryIds,
    priceMin,
    priceMax,
    distanceKm,
    latitude,
    longitude,
    setFilters,
    resetFilters
  }
})