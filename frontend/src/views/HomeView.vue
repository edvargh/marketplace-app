<template>
  <LoadingState :loading="loadingInitial" :error="error"/>

  <div v-if="!loadingInitial && !error" class="home-container">
    <div class="search-filter-container">
      <SearchBar />
      <CustomButton @click="toggleFilterPanel">
        {{ showFilters ? t('homeView.Hide-filters') : t('homeView.Show-filters') }}
      </CustomButton>
    </div>

    <FilterPanel
      v-if="showFilters  && categories.length > 0"
      :categories="categories"
      @applyFilters="handleApplyFilters"
    />

    <Categories :categories="categories" @category-click="handleCategoryClick" />

    <!-- Recommended Items -->
    <section class="recommendations">
      <div class="section-header">
        <h2>{{ t('homeView.Your-recommendations') }}</h2>
      </div>

      <HorizontalPagination>
        <DetailedItemCard
          v-for="item in recommendedItems"
          :key="item.id"
          :item="item"
        />
      </HorizontalPagination>
    
    <div v-if="recommendedItems.length === 0" class="no-items-message">
        {{ t('homeView.No-recommendet-items-found') }}
      </div>
    </section>

    <!-- Most Liked Items -->
    <section class="most-liked">
      <div class="section-header">
        <h2>{{ t('homeView.Most-popular-items') }}</h2>
      </div>
      <div v-if="mostLikedItems.length > 0" class="detailed-cards-container">
        <DetailedItemCard
          v-for="item in mostLikedItems"
          :key="item.id"
          :item="item"
        />
      </div>
      <div v-else class="no-items-message">
        {{ t('homeView.No-popular-items-found') }}
      </div>
    </section>

    <!-- Market Items -->
    <section class="market">
      <div class="section-header">
        <h2>{{ t('homeView.Market') }}</h2>
      </div>
      <CardGrid
        v-if="marketItems.length > 0"
        :items="marketItems"
        :cardComponent="CompactItemCard"
        variant="compact"
      />
      <div v-if="moreAvailable" class="load-more-wrapper">
        <button @click="loadMoreMarketItems" class="action-button button-cancel" :disabled="loadingMore">
          {{ loadingMore ? 'Loading...' : 'Load More' }}
        </button>
      </div>
      <div v-else-if="marketItems.length === 0 && !loadingInitial" class="no-items-message">
        {{ t('homeView.No-market-items-found') }}
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import DetailedItemCard from "@/components/DetailedItemCard.vue"
import CardGrid from '@/components/CardGrid.vue'
import CompactItemCard from "@/components/CompactItemCard.vue"
import SearchBar from "@/components/SearchBar.vue"
import Categories from '@/components/Categories.vue'
import LoadingState from '@/components/LoadingState.vue'
import FilterPanel from '@/components/FilterPanel.vue'
import CustomButton from "@/components/CustomButton.vue"
import HorizontalPagination from '@/components/HorizontalPagination.vue'
import { useCategoryStore } from "@/stores/categoryStore"
import { useItemStore } from "@/stores/itemStore"
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'
import { useFilterStore } from '@/stores/filterStore'
import { usePaginatedLoader } from '@/usePaginatedLoader.js'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const filterStore = useFilterStore()
const categoryStore = useCategoryStore()
const itemStore = useItemStore()

const categories = ref([])
const recommendedItems = ref([])
const mostLikedItems = ref([])
const showFilters = ref(false)

const {
  items: marketItems,
  loadMore: loadMoreMarketItems,
  moreAvailable,
  loadingInitial,
  loadingMore,
  error
} = usePaginatedLoader(itemStore.fetchMarketItems)

onMounted(async () => {
  try {
    await Promise.all([
      categoryStore.fetchCategories().then(c => categories.value = c),
      itemStore.fetchRecommendedItems().then(r => recommendedItems.value = r || []),
      loadMoreMarketItems()
    ])
  } catch (err) {
    error.value = "Something wrong happened while loading Home Page. Please try again."
  }
})

const toggleFilterPanel = () => {
  showFilters.value = !showFilters.value
}

function handleApplyFilters() {
  const query = filterStore.buildFiltersQuery({
    searchQuery: route.query.searchQuery || ''
  })

  router.push({ path: '/items', query })
}

function handleCategoryClick(category) {
  const query = {
    categoryIds: category.id.toString(),
    searchQuery: ''
  };
  router.push({ path: '/items', query });
}
</script>

<style scoped>
@import '../styles/views/HomeView.css';
@import '../styles/components/ItemFormButton.css';
</style>
