<template>
  <LoadingState :loading="loading" :error="error" loadingMessage="Loading your advertisements..."/>

  <div v-if="!loading && !error" class="my-items-container">
    <h2 class="my-items-title">My Items</h2>

    <div v-if="myItems.length > 0" class="my-items-grid">
      <CompactItemCard
        v-for="item in myItems"
        :key="item.id"
        :item="item"
      />
    </div>

    <div v-else class="no-items-message">
      You haven't listed any items yet.
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import CompactItemCard from '@/components/CompactItemCard.vue'
import { useItemStore } from '@/stores/itemStore'
import LoadingState from "@/components/LoadingState.vue";

const myItems = ref([])
const itemStore = useItemStore()
const loading = ref(true);
const error = ref(null);

onMounted(async () => {
  loading.value = true;
  try {
    const items = await itemStore.fetchUserItems()
    myItems.value = items
  } catch (err) {
    console.error('Failed to load your items:', err)
  } finally {
    loading.value = false;
  }
})
</script>

<style>
@import '../styles/users/MyItemsView.css';
</style>
  