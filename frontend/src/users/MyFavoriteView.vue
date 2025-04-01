<template>
    <div class="my-favorite-items-container">
      <h2 class="my-favorite-items-title">My Favorite Items</h2>
  
      <div v-if="myItems.length > 0" class="my-favorite-items-grid">
        <CompactItemCard
          v-for="item in myItems"
          :key="item.id"
          :item="item"
        />
      </div>
  
      <div v-else class="no-favorite-items-message">
        You don't have any items favorited yet.
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import CompactItemCard from '@/components/CompactItemCard.vue'
  import { useItemStore } from '@/stores/itemStore' 
  
  const myItems = ref([])
  const itemStore = useItemStore()

  onMounted(async () => {
    try {
      const items = await itemStore.fetchUserFavoriteItems()
      myItems.value = items
    } catch (err) {
      console.error('Failed to load your items:', err)
    }
  })
  </script>
  
<style>
@import '../styles/users/MyFavoriteView.css';
</style>