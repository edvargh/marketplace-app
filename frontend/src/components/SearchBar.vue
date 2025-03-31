<template>
  <div class="search-bar box">
    <input type="text" placeholder="Search..." class="search-input" v-model="searchQuery"/>
    <button class="search-button">
      <img src="/search-button.png" alt="Search button image" class="search-button-image" />
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const searchQuery = ref('')
</script>

<style scoped>
@import '../styles/SearchBar.css';
</style>