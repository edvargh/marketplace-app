<template>
  <div class="home-container">
    <div class="search-container">
      <SearchBar/>
    </div>

    <Categories :categories="categories"/>

    <!-- Recommended items -->
    <section class="recommendations">
      <div class="section-header">
        <h2>Your recommendations</h2>
      </div>
      <div v-if="recommendedItems.length > 0" class="detailed-cards-container">
        <DetailedItemCard
            v-for="item in mockItems"
            :key="item.id"
            :item="item"
        />
      </div>
      <div v-else class="no-items-message">
        No recommended items found
      </div>
    </section>

    <!-- Most Liked Items -->
    <section class="most-liked">
      <div class="section-header">
        <h2>Most popular items</h2>
      </div>
      <div v-if="mostLikedItems.length > 0" class="detailed-cards-container">
        <DetailedItemCard
            v-for="item in mockItems"
            :key="item.id"
            :item="item"
        />
      </div>
      <div v-else class="no-items-message">
        No popular items found
      </div>
    </section>

    <!-- Market Items -->
    <section class="market">
      <div class="section-header">
        <h2>Market</h2>
      </div>
      <div v-if="allItems.length > 0" class="compact-cards-container">
        <CompactItemCard
            v-for="item in allItems"
            :key="item.id"
            :item="item"
        />
      </div>
      <div v-else class="no-items-message">
        No market items found
      </div>
    </section>
  </div>
</template>




<script setup>
import { ref, onMounted } from 'vue';
import DetailedItemCard from "@/components/DetailedItemCard.vue";
import CompactItemCard from "@/components/CompactItemCard.vue";
import SearchBar from "@/components/SearchBar.vue";
import Categories from '@/components/Categories.vue';
<<<<<<< Updated upstream
import { useCategoryStore } from "@/stores/categoryStore";
import { useItemStore } from "@/stores/itemStore";
=======
import categoryStore from '@/stores/categoryStore';
>>>>>>> Stashed changes

const categoryStore = useCategoryStore();
const itemStore = useItemStore();

const categories = ref([]);
const recommendedItems = ref([]);
const mostLikedItems = ref([]);
<<<<<<< Updated upstream
const allItems = ref([]);

=======
const marketItems = ref([]);
const categories = categoryStore.fetchCategories();

// Check for token and fetch recommended items
onMounted(async() => {
  const userData = localStorage.getItem('user');
  // TODO: Check token in backend here
>>>>>>> Stashed changes

onMounted(async () => {
  try {
    const categoriesPromise = categoryStore.fetchCategories().then(cats => {
      categories.value = cats;
    });

    const itemsPromise = itemStore.fetchAllItems().then(items => {
      allItems.value = items || [];
    });

    await Promise.all([categoriesPromise, itemsPromise]);

  } catch (error) {
    console.error('Error loading data:', error);
  }
});

<<<<<<< Updated upstream
=======
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
      recommendedItems.value = await response.json();
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

    const userData = localStorage.getItem('user');
    const user = JSON.parse(userData);

    const headers = {
      'Authorization': `Bearer ${user.token}`,
      'Content-Type': 'application/json'
    };

    const response = await fetch('http://localhost:8080/api/items/all-items', {
      method: 'GET',
      headers: headers
    });

    console.log("Success fetching market items");

    if (response.ok) {
      marketItems.value = await response.json();
    } else {
      console.error('Failed to fetch market items:', response.status);
    }
  } catch (error) {
    console.error('Error fetching market items:', error);
  }
}



// Mock data for categories
const mockCategories = ref([
  { id: 1, name: 'Kitchen', image: 'kitchen-items.jpg' },
  { id: 2, name: 'Cars', image: 'cars.webp' },
  { id: 3, name: 'Tech', image: 'tech.webp' },
  { id: 4, name: 'Sports', image: 'sports.jpg' },
  { id: 5, name: 'Houses', image: 'houses.jpg' }
]);

// Mock data for item
const mockItems = ref([
  {
    title: 'Flower',
    price: 495,
    location: 'Trondheim',
    category: 'Garden',
    subCategory: 'Flower',
    description: 'This is a description used for a mock data of an item. Should not display more than tree lines of the description, if it is longer. Hope this works. ',
    status: "reserved",
    image: 'edit-icon.png',
    profile: 'houses.jpg'
  }, {
    title: 'This is a long title at three lines. Should not display more than 2 lines',
    price: 495,
    location: 'Trondheim',
    category: 'Garden',
    subCategory: 'Flower',
    description: 'This is a short description',
    status: "sold",
    image: 'default-picture.jpg',
    profile: 'houses.jpg'
  }, {
    title: 'This is for a long title, so we can see and check',
    price: 495,
    location: 'Trondheim',
    category: 'Garden',
    subCategory: 'Flower',
    description: 'This is a description used for a mock data of an item. Should not display more than tree lines of the description, if it is longer. Hope this works. Should not display more than tree lines of the description',
    status: "",
    image: 'houses.jpg',
    profile: 'sports.jpg'
  },
])
>>>>>>> Stashed changes
</script>


<style scoped>
@import '../styles/HomeView.css';
</style>
