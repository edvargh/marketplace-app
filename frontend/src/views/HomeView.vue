<template>
  <div class="home-container">
    <div class="search-container">
      <SearchBar/>
    </div>

    <div class="categories">
      <h3>Categories</h3>
      <ul>
        <!-- Loop through categories and display them -->
        <li v-for="category in categories" :key="category.id">
          <img
              :src="category.image"
              :alt="category.name"
              class="category-image"
          >
          {{ category.name }}
        </li>
      </ul>
    </div>

    <!-- Most Liked Items -->
    <section class="most-liked">
      <div class="section-header">
        <h2>Most popular items</h2>
      </div>
      <div class="detailed-cards-container">
        <DetailedItemCard
            v-for="item in items"
            :key="item.id"
            :item="item"
        />
      </div>
    </section>

    <!-- Market Items -->
    <section class="market">
      <div class="section-header">
        <h2>Market</h2>
      </div>
      <div class="compact-cards-container">
        <CompactItemCard
            v-for="item in items"
            :key="item.id"
            :item="item"
        />
      </div>
    </section>

  </div>
</template>





<script setup>
import { ref, onMounted } from 'vue';
import DetailedItemCard from "@/components/DetailedItemCard.vue";
import CompactItemCard from "@/components/CompactItemCard.vue";
import SearchBar from "@/components/SearchBar.vue";

const hasToken = ref(false);
const recommendations = ref([]);
const mostLiked = ref([]);
const market = ref([]);

// Check for token and fetch recommended items
onMounted(() => {
  const token = localStorage.getItem('token');
  hasToken.value = !!token;

  if (hasToken.value) {
    fetchRecommendedItems();
  }
});

async function fetchRecommendedItems() {
  try {
    console.log("Fetching recommended items ...");
    const response = await fetch('', { // TODO: Backend method and implement in HTML above
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    console.log("Success fetching recommended items");

    if (response.ok) {
      recommendations.value = await response.json();
    }
  } catch (error) {
    console.error('Error fetching recommended items:', error);
  }
}

async function fetchMostLikedItems() {
  try {
    console.log("Fetching most liked items ...");
    const response = await fetch(''); // TODO: Backend method and implement in HTML above
    console.log("Success fetching most liked items");

    if (response.ok) {
      mostLikedItems.value = await response.json();
    }
  } catch (error) {
    console.error('Error fetching most liked items:', error);
  }
}

async function fetchMarketItems() {
  try {
    console.log("Fetching market items ...");
    const response = await fetch(''); // TODO: Backend method and implement in HTML above
    console.log("Success fetching market items");

    if (response.ok) {
      marketItems.value = await response.json();
    }
  } catch (error) {
    console.error('Error fetching market items:', error);
  }
}


// Mock data for categories
const categories = ref([
  { id: 1, name: 'Kitchen', image: 'kitchen-items.jpg' },
  { id: 2, name: 'Cars', image: 'cars.webp' },
  { id: 3, name: 'Tech', image: 'tech.webp' },
  { id: 4, name: 'Sports', image: 'sports.jpg' },
  { id: 5, name: 'Houses', image: 'houses.jpg' }
]);

// Mock data for item
const items = ref([
  {
    title: 'Flower',
    price: 495,
    location: 'Trondheim',
    category: 'Garden',
    subCategory: 'Flower',
    description: 'This is a description used for a mock data of an item. Should not display more than tree lines of the description, if it is longer. Hope this works. ',
    status: "reserved"
  }, {
    title: 'This is a long title at three lines. Should not display more than 2 lines',
    price: 495,
    location: 'Trondheim',
    category: 'Garden',
    subCategory: 'Flower',
    description: 'This is a short description',
    status: "sold"
  }, {
    title: 'This is for a long title, so we can see and check',
    price: 495,
    location: 'Trondheim',
    category: 'Garden',
    subCategory: 'Flower',
    description: 'This is a description used for a mock data of an item. Should not display more than tree lines of the description, if it is longer. Hope this works. Should not display more than tree lines of the description',
    status: ""
  },
])
</script>


<style scoped>
@import '../styles/HomeView.css';
</style>
