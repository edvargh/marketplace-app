<template>
  <LoadingState :loading="loadingInitial" :error="error" loadingMessage="Loading your favorite advertisements..."/>

  <div v-if="!loadingInitial && !error" class="my-favorite-items-container">
    <h2 class="my-favorite-items-title">My Favorite Items</h2>

    <CardGrid
      v-if="myFavorites.length > 0"
      :items="myFavorites"
      :cardComponent="CompactItemCard"
      variant="compact"
    />

    <div v-if="moreAvailable" class="load-more-wrapper">
      <button @click="loadMore" type="button" class="action-button button-cancel" :disabled="loadingMore">
        {{ loadingMore ? 'Loading...' : 'Load More' }}
      </button>
    </div>

    <div v-else-if="myFavorites.length === 0" class="no-favorite-items-message">
      You have not favorited any items yet.
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import CompactItemCard from '@/components/CompactItemCard.vue'
import CardGrid from '@/components/CardGrid.vue'
import { useItemStore } from '@/stores/itemStore'
import LoadingState from "@/components/LoadingState.vue";
import { usePaginatedLoader } from '@/usePaginatedLoader.js'

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
    error.value = "Something went wrong while loading your favorite advertisements. Please try again."
  }
})
</script>

<style>
@import '../styles/users/MyFavoriteView.css';
@import '../styles/components/ItemFormButton.css';
</style>