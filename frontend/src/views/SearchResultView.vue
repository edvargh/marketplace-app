<template>
    <div class="search-results">
      <h2 v-if="search">Results for "{{ search }}"</h2>
      <div v-if="items.length">
        <CompactItemCard v-for="item in items" :key="item.id" :item="item" />
      </div>
      <div v-else>
        <p>No items found.</p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed, onMounted, watch } from 'vue'
  import { useRoute } from 'vue-router'
  import { useItemStore } from '@/stores/itemStore'
  import CompactItemCard from '@/components/CompactItemCard.vue'
  
  
  const store = useItemStore()
  const route = useRoute()
  
  const items = computed(() => store.items) // ✅ unwrap for use in template
  const search = computed(() => route.query.searchQuery || '')
  
  const fetchItems = async () => {
    await store.searchItems(route.query)
  }
  
  onMounted(fetchItems)
  watch(() => route.query, fetchItems, { deep: true })
  </script>
  
  <style scoped>
  @import '../styles/views/SearchResultView.css';
  </style>
  