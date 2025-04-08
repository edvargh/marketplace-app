<template>
  <LoadingState :loading="loadingInitial" :error="error" :loadingMessage="t('MyFavouriteView.Loading-favorites')" />

  <div v-if="!loadingInitial && !error" class="my-favorite-items-container">
    <h2 class="my-favorite-items-title">{{t('MyFavouriteView.My-favorite-items')}}</h2>

    <CardGrid
      v-if="myFavorites.length > 0"
      :items="myFavorites"
      :cardComponent="CompactItemCard"
      variant="compact"
    />

    <div v-if="moreAvailable" class="load-more-wrapper">
      <button @click="loadMore" type="button" class="action-button button-cancel" :disabled="loadingMore">
        {{ loadingMore ? t('MyFavouriteView.Loading') : t('MyFavouriteView.Load-more') }}
      </button>
    </div>

    <div v-else-if="myFavorites.length === 0" class="no-favorite-items-message">
      {{ t('MyFavouriteView.No-favorites') }}
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import CompactItemCard from '@/components/CompactItemCard.vue'
import CardGrid from '@/components/CardGrid.vue'
import { useItemStore } from '@/stores/itemStore'
import LoadingState from "@/components/LoadingState.vue";
import { useI18n } from 'vue-i18n'
import { usePaginatedLoader } from '@/usePaginatedLoader.js'

const { t } = useI18n()

const itemStore = useItemStore()
const {
  items: myFavorites,
  loadingInitial,
  loadingMore,
  loadMore,
  moreAvailable,
  error
} = usePaginatedLoader(itemStore.fetchUserFavoriteItems)

onMounted(async () => {
  try {
    await loadMore()
  } catch (err) {
    error.value = t('MyFavouriteView.Error-loading')
  }
})
</script>

<style>
@import '../styles/users/MyFavoriteView.css';
</style>