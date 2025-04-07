<template>
  <button class="favorite-btn" @click="toggleFavorite">
    <span :class="isFavorite ? 'favorite' : ''">
      {{ isFavorite ? '❤️' : '🤍' }}
    </span>
    {{ isFavorite ? 'Unfavorite' : 'Favorite' }}
  </button>
</template>

<script setup>
import { useItemStore } from '@/stores/itemStore';
import { useRoute } from 'vue-router';

const route = useRoute();
const itemStore = useItemStore();
const itemId = route.params.id;

const props = defineProps({
  isFavorite: Boolean,
});

const emit = defineEmits(['update:isFavorite']);

const toggleFavorite = async () => {
  try {
    const success = await itemStore.toggleFavorite(itemId);
    if (success) {
      emit('update:isFavorite', !props.isFavorite);
    }
  } catch (error) {
    console.error('Failed to toggle favorite:', error);
  }
};
</script>

<style scoped>
@import '../styles/components/FavoriteBtn.css';
</style>