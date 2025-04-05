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
    <h2 v-else-if="selectedCategoryName">Results for category "{{ selectedCategoryName }}"</h2>

    <LoadingState 
      :loading="isLoading" 
      :error="error"
      loadingMessage="Searching for items..."
      @retry="fetchItems"
    />

    <div v-if="!isLoading && !error && items.length > 0" class="item-container">
      <CompactItemCard
        v-for="item in items"
        :key="item.id"
        :item="item"
      />
    </div>
    <div v-if="!isLoading && !error && items.length === 0" class="no-items-message">
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
import LoadingState from '@/components/LoadingState.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const categoryStore = useCategoryStore()
const itemStore = useItemStore()
const filterStore = useFilterStore()

const showFilters = ref(false)
const categories = ref([])
const isLoading = ref(true) 
const error = ref(null) 

const items = computed(() => itemStore.items)

const search = computed(() => route.query.searchQuery || '')

const toggleFilterPanel = () => {
  showFilters.value = !showFilters.value
}

function handleApplyFilters() {
  const query = filterStore.buildFiltersQuery({
    searchQuery: route.query.searchQuery || ''
  })
  router.push({ path: '/items', query })
}

const fetchItems = async () => {
  isLoading.value = true
  error.value = null
  
  const params = { ...route.query };
  
  if (params.categoryIds) {
    const categoryIdArray = Array.isArray(params.categoryIds) 
      ? params.categoryIds.map(id => parseInt(id, 10))
      : [parseInt(params.categoryIds, 10)];
    
    delete params.categoryIds;
    params.categoryIds = categoryIdArray;
  }
  
  if (params.minPrice) params.minPrice = Number(params.minPrice);
  if (params.maxPrice) params.maxPrice = Number(params.maxPrice);
  if (params.distanceKm) params.distanceKm = Number(params.distanceKm);
  if (params.latitude) params.latitude = Number(params.latitude);
  if (params.longitude) params.longitude = Number(params.longitude);
  
  try {
    await itemStore.searchItems(params);
  } catch (err) {
    console.error('Error fetching items:', err);
    error.value = "Failed to load items. Please try again.";
  } finally {
    isLoading.value = false;
  }
}

onMounted(async () => {
  isLoading.value = true;
  error.value = null;
  
  try {
    const cats = await categoryStore.fetchCategories();
    categories.value = cats;

    filterStore.setFilters({
      categories: route.query.categories
        ? route.query.categories.split(',').map(Number)
        : [],
      priceMin: route.query.minPrice ?? '',
      priceMax: route.query.maxPrice ?? '',
      distanceKm: route.query.distanceKm ?? '',
      latitude: route.query.latitude ? Number(route.query.latitude) : null,
      longitude: route.query.longitude ? Number(route.query.longitude) : null
    });

    await fetchItems();
  } catch (err) {
    error.value = "Failed to initialize search. Please try again.";
  } finally {
    isLoading.value = false;
  }
})

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
    });
    fetchItems();
  },
  { deep: true }
)

const selectedCategoryName = computed(() => {
  const categoryIdParam = route.query.categoryIds;
  const categoryId = Array.isArray(categoryIdParam)
    ? parseInt(categoryIdParam[0], 10)
    : parseInt(categoryIdParam, 10);
  if (!categoryId || !categories.value.length) return '';
  const match = categories.value.find(cat => cat.id === categoryId);
  return match ? match.name : '';
});

</script>

<style>
@import '../styles/views/SearchResultView.css';
</style>