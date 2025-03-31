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
import { useCategoryStore } from "@/stores/categoryStore";
import { useItemStore } from "@/stores/itemStore";

const categoryStore = useCategoryStore();
const itemStore = useItemStore();

const categories = ref([]);
const recommendedItems = ref([]);
const mostLikedItems = ref([]);
const allItems = ref([]);


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

</script>


<style scoped>
@import '../styles/HomeView.css';
</style>