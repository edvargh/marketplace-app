<script setup>
defineProps({
  categories: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['category-click']);

const handleCategoryClick = (category) => {
  emit('category-click', category);
};
</script>

<template>
  <div class="categories">
    <h3>Most popular categories</h3>
    <ul>
      <li v-for="category in categories" :key="category.id" @click="handleCategoryClick(category)">
        <img
            :src="category.image"
            :alt="category.name"
            class="category-image"
        >
        {{ category.name }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
@import '../styles/components/Categories.css';
</style>