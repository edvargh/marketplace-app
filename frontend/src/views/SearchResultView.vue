<template>
  <div class="search-results">
    <div class="search-filter-container">
      <SearchBar />
      <CustomButton @click="toggleFilterPanel">
        {{ showFilters ? t('homeView.Hide-filters') : t('homeView.Show-filters') }}
      </CustomButton>
    </div>

    <FilterPanel
      v-if="showFilters && categories.length > 0"
      :categories="categories"
      @applyFilters="handleApplyFilters"
    />

    <h2 v-if="search">Results for "{{ search }}"</h2>

    <div v-if="items.length">
      <CompactItemCard
        v-for="item in items"
        :key="item.id"
        :item="item"
      />
    </div>
    <div v-else>
      <p>No items found.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

import { useItemStore } from '@/stores/itemStore'
import { useCategoryStore } from '@/stores/categoryStore'
import { useFilterStore } from '@/stores/filterStore'

import CompactItemCard from '@/components/CompactItemCard.vue'
import SearchBar from '@/components/SearchBar.vue'
import FilterPanel from '@/components/FilterPanel.vue'
import CustomButton from '@/components/CustomButton.vue'

const { t } = useI18n()

const route = useRoute()
const router = useRouter()
const categoryStore = useCategoryStore()
const itemStore = useItemStore()
const filterStore = useFilterStore()

const showFilters = ref(false)
const categories = ref([])

// Items from the store
const items = computed(() => itemStore.items)

// If there's a `searchQuery` param in the URL, display it
const search = computed(() => route.query.searchQuery || '')

// Toggle whether to show/hide the filter panel
const toggleFilterPanel = () => {
  showFilters.value = !showFilters.value
}

// Called when user hits "Apply Filters" in FilterPanel
// This is the handleApplyFilters function that should be used in both views
const handleApplyFilters = (filters) => {
  const query = {
    ...route.query,
    searchQuery: route.query.searchQuery || ''
  }

  // Handle categories - ensure they're properly processed
  if (filters.categories && filters.categories.length) {
    // Convert all categories to strings for URL
    query.categories = filters.categories
      .map(id => id.toString())
      .join(',')
  } else {
    delete query.categories
  }

  // Add other filters
  if (filters.priceMin !== null && filters.priceMin !== undefined && filters.priceMin !== '') {
    query.minPrice = filters.priceMin
  } else {
    delete query.minPrice
  }
  
  if (filters.priceMax !== null && filters.priceMax !== undefined && filters.priceMax !== '') {
    query.maxPrice = filters.priceMax
  } else {
    delete query.maxPrice
  }
  
  if (filters.distanceKm !== null && filters.distanceKm !== undefined && filters.distanceKm !== '') {
    query.distanceKm = filters.distanceKm
  } else {
    delete query.distanceKm
  }
  
  if (filters.latitude !== null && filters.latitude !== undefined) {
    query.latitude = filters.latitude
  } else {
    delete query.latitude
  }
  
  if (filters.longitude !== null && filters.longitude !== undefined) {
    query.longitude = filters.longitude
  } else {
    delete query.longitude
  }

  // Update the URL with the new query parameters
  router.push({ path: '/items', query })
}

// Fetch items based on current route query
const fetchItems = async () => {
  const params = { ...route.query }
  
  // Convert categories string to array of numbers for the API
  if (params.categories) {
    params.categories = params.categories
      .split(',')
      .map(id => parseInt(id.trim(), 10))
      .filter(id => !isNaN(id))
  }
  
  // Convert numeric parameters to numbers
  if (params.minPrice) params.minPrice = Number(params.minPrice)
  if (params.maxPrice) params.maxPrice = Number(params.maxPrice)
  if (params.distanceKm) params.distanceKm = Number(params.distanceKm)
  if (params.latitude) params.latitude = Number(params.latitude)
  if (params.longitude) params.longitude = Number(params.longitude)
  
  await itemStore.searchItems(params)
}

// On first load, fetch categories and initialize filter store from the URL
onMounted(async () => {
  // Get categories from the store
  const cats = await categoryStore.fetchCategories()
  categories.value = cats

  // Sync the store with the existing query (if any)
  filterStore.setFilters({
    categories: route.query.categories
      ? route.query.categories.split(',').map(Number)
      : [],
    priceMin: route.query.minPrice ?? '',
    priceMax: route.query.maxPrice ?? '',
    distanceKm: route.query.distanceKm ?? '',
    latitude: route.query.latitude ? Number(route.query.latitude) : null,
    longitude: route.query.longitude ? Number(route.query.longitude) : null
  })

  // Fetch items based on those initial query params
  await fetchItems()
})

// Whenever route.query changes, re-sync the filter store and re-fetch items
watch(
  () => route.query,
  () => {
    filterStore.setFilters({
      categories: route.query.categories
        ? route.query.categories.split(',').map(Number)
        : [],
      priceMin: route.query.minPrice ?? '',
      priceMax: route.query.maxPrice ?? '',
      distanceKm: route.query.distanceKm ?? '',
      latitude: route.query.latitude ? Number(route.query.latitude) : null,
      longitude: route.query.longitude ? Number(route.query.longitude) : null
    })
    fetchItems()
  },
  { deep: true }
)
</script>

<style>
@import '../styles/views/SearchResultView.css';
</style>
