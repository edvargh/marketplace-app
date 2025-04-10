<template>
  <div class="search-bar box">
    <input
      id ="search-input"
      name ="search-input"
      type="text"
      placeholder="Search..."
      class="search-input"
      v-model="searchQuery"
      @keyup.enter="performSearch"
    />
    <button class="search-button" @click="performSearch" aria-label="Search">
      <img src="/search-icon.png" alt="Search button image" class="search-button-image" />
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const searchQuery = ref('')

const performSearch = () => {
  const query = searchQuery.value.trim()
  if (query) {
    router.push({ path: '/items', query: { searchQuery: query } }) 
  }
}
</script>

<style scoped>
@import '../styles/components/SearchBar.css';
</style>
