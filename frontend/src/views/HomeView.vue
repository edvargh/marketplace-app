<template>
  <LoadingState :loading="loadingInitial" :error="error" :loadingMessage="t('homeView.Loading-homeView')" />

  <div v-if="!loadingInitial && !error" class="home-container">
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

    <Categories :categories="categories" @category-click="handleCategoryClick" />

    <!-- Recommended Items -->
    <section class="recommendations">
      <div class="section-header">
        <h2>{{ t('homeView.Your-recommendations') }}</h2>
      </div>

      <div v-if="loadingRecommended" class="recommendation-skeleton">
        <div v-for="i in 5" :key="`skeleton-${i}`" class="skeleton-card"></div>
      </div>

      <HorizontalPagination
        v-else-if="recommendedItems.length > 0"
        @update:cloneStart="handleCloneStart"
        @update:cloneEnd="handleCloneEnd"
      >
        <DetailedItemCard
          v-for="item in recommendedItems"
          :key="item.id"
          :item="item"
          :seller="sellerMap[item.sellerId]"
          class="carousel-item"
        />

        <template #clone-start v-if="cloneStartItems.length > 0">
          <DetailedItemCard
            v-for="item in cloneStartItems"
            :key="`clone-start-${item.id}`"
            :item="item"
            :seller="sellerMap[item.sellerId]"
            class="carousel-item"
          />
        </template>

        <template #clone-end v-if="cloneEndItems.length > 0">
          <DetailedItemCard
            v-for="item in cloneEndItems"
            :key="`clone-end-${item.id}`"
            :item="item"
            :seller="sellerMap[item.sellerId]"
            class="carousel-item"
          />
        </template>
      </HorizontalPagination>

      <div v-else class="no-items-message">
        {{ t('homeView.No-recommended-items-found') }}
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
          {{ loadingMore ? t('homeView.Loading') : t('homeView.Load-more') }}
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
import { useUserStore } from '@/stores/userStore'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const filterStore = useFilterStore()
const userStore = useUserStore()
const categoryStore = useCategoryStore()
const itemStore = useItemStore()

const sellerMap = ref({})
const cloneStartItems = ref([])
const cloneEndItems = ref([])
const categories = ref([])
const recommendedItems = ref([])
const showFilters = ref(false)
const loadingRecommended = ref(true)

const {
  items: marketItems,
  loadMore: loadMoreMarketItems,
  moreAvailable,
  loadingInitial,
  loadingMore,
  error
} = usePaginatedLoader(itemStore.fetchMarketItems)

const handleCloneStart = ({ start, end }) => {
  cloneStartItems.value = [...(recommendedItems.value.slice(start, end) || [])];
};

const handleCloneEnd = ({ start, end }) => {
  cloneEndItems.value = [...(recommendedItems.value.slice(start, end) || [])];
};

const fetchAllSellers = async (items) => {
  if (!items || items.length === 0) return;

  const sellerIds = [...new Set(items.map(item => item.sellerId))]
    .filter(id => id && !sellerMap.value[id]);

  if (sellerIds.length === 0) return;

  try {
    const fetchPromises = sellerIds.map(async (sellerId) => {
      try {
        return { id: sellerId, data: await userStore.getUserById(sellerId) };
      } catch (err) {
        return { id: sellerId, data: null };
      }
    });

    const sellers = await Promise.all(fetchPromises);

    const newSellerMap = { ...sellerMap.value };
    sellers.forEach(({ id, data }) => {
      if (data) {
        newSellerMap[id] = data;
      }
    });

    sellerMap.value = newSellerMap;
  } catch (err) {
    error.value = t('homeView.ErrorLoading')
  }
};

onMounted(async () => {
  try {
    loadingRecommended.value = true;

    const categoriesPromise = categoryStore.fetchCategories()
      .then(cats => {
        categories.value = cats;
      });
    
    const marketPromise = loadMoreMarketItems();
    
    await categoriesPromise;
    
    const recommendedPromise = itemStore.fetchRecommendedItems()
      .then(items => {
        recommendedItems.value = items || [];
        if (items && items.length > 0) {
          return fetchAllSellers(items);
        }
      })
      .finally(() => {
        loadingRecommended.value = false;
      });
    
    await Promise.all([recommendedPromise, marketPromise]);
    
    if (marketItems.value && marketItems.value.length > 0) {
      await fetchAllSellers(marketItems.value);
    }
  } catch (e) {
    error.value = t('homeView.ErrorLoading')
    loadingRecommended.value = false;
  }
});

const toggleFilterPanel = () => {
  showFilters.value = !showFilters.value;
};

function handleApplyFilters() {
  const query = filterStore.buildFiltersQuery({
    searchQuery: route.query.searchQuery || ''
  });
  router.push({ path: '/items', query });
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