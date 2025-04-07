<template>
  <LoadingState :loading="loading" :error="error"/>

  <div v-if="!loading && !error" class="home-container">
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
      <div v-else class="no-items-message">
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
import { useCategoryStore } from "@/stores/categoryStore"
import { useItemStore } from "@/stores/itemStore"
import FilterPanel from '@/components/FilterPanel.vue'
import CustomButton from "@/components/CustomButton.vue"
import HorizontalPagination from '@/components/HorizontalPagination.vue'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'
import { useFilterStore } from '@/stores/filterStore'
import { useUserStore } from '@/stores/userStore'


const route = useRoute()
const router = useRouter()

const { t, locale } = useI18n()

const filterStore = useFilterStore()
const userStore = useUserStore()
const categoryStore = useCategoryStore()
const itemStore = useItemStore()

const categories = ref([])
const recommendedItems = ref([])
const mostLikedItems = ref([])
const marketItems = ref([])
const showFilters = ref(false)
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  loading.value = true
  try {
    if (userStore.user?.preferredLanguage) {
      locale.value = userStore.user.preferredLanguage
    }

    const categoriesPromise = categoryStore.fetchCategories().then(cats => {
      categories.value = cats
    })

    const itemsPromise = itemStore.fetchMarketItems().then(items => {
      marketItems.value = items || []
    })

    const recommendedPromise = itemStore.fetchRecommendedItems().then(items => {
      recommendedItems.value = items || []
    })

    await Promise.all([categoriesPromise, itemsPromise, recommendedPromise])
  } catch (e) {
    error.value = "Something wrong happened while loading Home Page. Please try again."
  } finally {
    loading.value = false
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
</style>
