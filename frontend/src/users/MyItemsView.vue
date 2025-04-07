<template>
  <LoadingState :loading="loadingInitial" :error="error" loadingMessage="Loading your advertisements..."/>

  <div v-if="!loadingInitial && !error" class="my-items-container">
    <h2 class="my-items-title">My Items</h2>

    <div v-if="myItems.length > 0" class="my-items-grid">
      <CardGrid
        :items="myItems"
        :cardComponent="CompactItemCard"
        variant="compact"
      />
    </div>

    <div v-if="moreAvailable" class="load-more-wrapper">
      <button @click="loadMore" type="button" class="action-button button-cancel" :disabled="loadingMore">
        {{ loadingMore ? 'Loading...' : 'Load More' }}
      </button>
    </div>

    <div v-else-if="myItems.length === 0" class="no-items-message">
      You haven't listed any items yet.
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useItemStore } from '@/stores/itemStore'
import { usePaginatedLoader } from '@/usePaginatedLoader.js'
import CompactItemCard from '@/components/CompactItemCard.vue'
import LoadingState from "@/components/LoadingState.vue";
import CardGrid from '@/components/CardGrid.vue'

const itemStore = useItemStore()

const {
  items: myItems,
  loadingInitial,
  loadingMore,
  loadMore,
  moreAvailable,
  error
} = usePaginatedLoader(itemStore.fetchUserItems)

onMounted(async () => {
  try {
    await loadMore()
  } catch (err) {
    error.value = "Something went wrong while loading your advertisements. Please try again."
  }
})
</script>

<style>
@import '../styles/users/MyItemsView.css';
@import '../styles/components/ItemFormButton.css';
</style>
  