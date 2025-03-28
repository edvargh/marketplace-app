<template>
  <div class="home-container">
    <div class="search-bar">
      <input type="text" placeholder="Search items, collections, and accounts" />
    </div>

    <div class="categories">
      <h3>Categories</h3>
      <ul>
        <!-- Loop through categories and display them -->
        <li v-for="category in categories" :key="category.id">
          {{ category.name }}
        </li>
      </ul>
    </div>

    <section class="recommendations">
      <div class="section-header">
        <h2>Your recommendations</h2>
      </div>
      <div class="recommendations-grid">
        <p>Recommendations here</p>
      </div>
    </section>

    <section class="market">
      <div class="section-header">
        <h2>Market</h2>
      </div>
      <div class="market-grid">
        <p>Market here</p>
      </div>
    </section>
  </div>
</template>


<script setup>
import { ref } from 'vue'

// Mock data for categories
const categories = ref([
  { id: 1, name: 'Kitchen' },
  { id: 2, name: 'Cars' },
  { id: 3, name: 'Computers' },
  { id: 4, name: 'Sports' },
  { id: 5, name: 'Houses' },
])

// Mock data for item
const items = ref([
  {
    id: 1,
    title: 'Flower',
    price: 495,
    location: 'Zombie Lab',
    category: 'NFT',
    subCategory: 'Art',
    description:
      'Zombie Lab is a collection of 10,000 animated NFTs. Each NFT is unique and resides on the Ethereum blockchain. Your Zombie Lab NFT will...',
    imageUrl: '/path/to/flower-image.jpg', // Replace with actual image path
    reservedStatus: false,
  },
])
</script>


<style scoped>
@import '../styles/HomeView.css';
</style>
