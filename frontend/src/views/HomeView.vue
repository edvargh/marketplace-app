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
      <div class="nft-cards-container">
        <ItemCard
            v-for="item in items"
            :key="item.id"
            :item="item"
        />
      </div>
    </section>
  </div>
</template>





<script setup>
import { ref } from 'vue';
import ItemCard from '@/components/ItemCard.vue'


// Mock data for categories
const categories = ref([
  { id: 1, name: 'Kitchen' },
  { id: 2, name: 'Cars' },
  { id: 3, name: 'Computers' },
  { id: 4, name: 'Sports' },
  { id: 5, name: 'Houses' }
]);

// Mock data for item
const items = ref([
  {
    id: 1,
    title: 'Flower',
    price: 495,
    location: 'Trondheim',
    category: 'Garden',
    subCategory: 'Flower',
    description: 'This is a description used for a mock data of an item. Should not display more than tree lines of the description, if it is longer. Hope this works. ',
    imageUrl: '/path/to/flower-image.jpg', // Replace with actual image path
    reservedStatus: false
  },
])

</script>


<style scoped>
@import '../styles/HomeView.css';
</style>
