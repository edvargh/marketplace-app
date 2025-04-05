<template>
  <LoadingState :loading="loading" :error="error" loadingMessage="Loading your favorite advertisements..."/>

  <div v-if="!loading && !error" class="my-favorite-items-container">
      <h2 class="my-favorite-items-title">My Favorite Items</h2>

      <CardGrid
        v-if="myItems.length > 0"
        :items="myItems"
        :cardComponent="CompactItemCard"
        variant="compact"
      />
      <div v-else class="no-favorite-items-message">
        You have not favorited any items yet.
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import CompactItemCard from '@/components/CompactItemCard.vue'
  import CardGrid from '@/components/CardGrid.vue'
  import { useItemStore } from '@/stores/itemStore'
  import LoadingState from "@/components/LoadingState.vue";
  
  const myItems = ref([])
  const itemStore = useItemStore()
  const loading = ref(true);
  const error = ref(null);

  onMounted(async () => {
    loading.value = true;
    try {
      const items = await itemStore.fetchUserFavoriteItems()
      myItems.value = items

    } catch (e) {
      error.value = "Something wrong happened while loading the page. Please try again.";
    } finally {
      loading.value = false;
    }
  })
  </script>
  
<style>
@import '../styles/users/MyFavoriteView.css';
</style>