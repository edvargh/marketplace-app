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
      @retry="loadMore"
    />

    <div v-if="!isLoading && !error && items.length > 0">
      <CardGrid
        v-if="items.length > 0"
        :items="items"
        :cardComponent="CompactItemCard"
        variant="compact"
      />
    </div>
    <div v-if="moreAvailable && items.length > 0" class="load-more-wrapper">
      <button
        @click="loadMore"
        class="action-button button-cancel"
        :disabled="loadingMore"
      >
        {{ loadingMore ? 'Loading...' : 'Load More' }}
      </button>
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
import { usePaginatedLoader } from '@/usePaginatedLoader.js'
import CompactItemCard from '@/components/CompactItemCard.vue'
import SearchBar from '@/components/SearchBar.vue'
import FilterPanel from '@/components/FilterPanel.vue'
import CustomButton from '@/components/CustomButton.vue'
import LoadingState from '@/components/LoadingState.vue'
import CardGrid from '@/components/CardGrid.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const categoryStore = useCategoryStore()
const itemStore = useItemStore()
const filterStore = useFilterStore()

const showFilters = ref(false)
const categories = ref([])

const search = computed(() => route.query.searchQuery || '')

const toggleFilterPanel = () => {
  showFilters.value = !showFilters.value
}

function handleApplyFilters() {
  const builtQuery = filterStore.buildFiltersQuery({
    searchQuery: route.query.searchQuery || ''
  });
  router.push({ path: '/items', query: builtQuery });
  showFilters.value = false;
}

const formatFilters = () => {
  const params = { ...route.query };

  if (params.categoryIds) {
    params.categoryIds = Array.isArray(params.categoryIds)
      ? params.categoryIds.map(id => parseInt(id, 10))
      : [parseInt(params.categoryIds, 10)];
  }

  if (params.minPrice) params.minPrice = Number(params.minPrice);
  if (params.maxPrice) params.maxPrice = Number(params.maxPrice);
  if (params.distanceKm) params.distanceKm = Number(params.distanceKm);
  if (params.latitude) params.latitude = Number(params.latitude);
  if (params.longitude) params.longitude = Number(params.longitude);

  return params;
}

const fetchPaginatedItems = async (page, size) => {
  const filters = formatFilters();
  return await itemStore.searchItems({ ...filters }, page, size);
}

const {
  items,
  page,
  loadMore,
  loadingInitial: isLoading,
  loadingMore,
  error,
  moreAvailable
} = usePaginatedLoader(fetchPaginatedItems)

onMounted(async () => {
  try {
    categories.value = await categoryStore.fetchCategories();

    filterStore.setFilters({
      categoryIds: route.query.categoryIds
        ? Array.isArray(route.query.categoryIds)
          ? route.query.categoryIds.map(Number)
          : route.query.categoryIds.split(',').map(Number)
        : [],
      priceMin: route.query.minPrice ?? '',
      priceMax: route.query.maxPrice ?? '',
      distanceKm: route.query.distanceKm ?? '',
      latitude: route.query.latitude ? Number(route.query.latitude) : null,
      longitude: route.query.longitude ? Number(route.query.longitude) : null
    });

    await loadMore();
  } catch (err) {
    error.value = "Failed to initialize search. Please try again.";
  }
})

watch(
  () => route.query,
  async () => {
      filterStore.setFilters({
      categoryIds: route.query.categoryIds
        ? Array.isArray(route.query.categoryIds)
          ? route.query.categoryIds.map(Number)
          : route.query.categoryIds.split(',').map(Number)
        : [],
      priceMin: route.query.minPrice ?? '',
      priceMax: route.query.maxPrice ?? '',
      distanceKm: route.query.distanceKm ?? '',
      latitude: route.query.latitude ? Number(route.query.latitude) : null,
      longitude: route.query.longitude ? Number(route.query.longitude) : null
    });

    items.value.length = 0;
    moreAvailable.value = true;
    error.value = null;
    page.value = 0
    try {
      await loadMore();
    } catch (err) {
      error.value = "Failed to load items. Please try again.";
    }
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
</style>