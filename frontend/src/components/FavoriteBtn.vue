<template>
  <button class="favorite-btn" @click="toggleFavorite">
    <span :class="isFavorite ? 'favorite' : ''">
      {{ isFavorite ? '❤️' : '🤍' }}
    </span>
    {{ isFavorite ? 'Unfavorite' : 'Favorite' }}
  </button>
    <ErrorMessage v-if="errorMessage" :message="errorMessage" />
</template>

<script setup>
import { useItemStore } from '@/stores/itemStore';
import { useRoute } from 'vue-router';
import ErrorMessage from './ErrorMessage.vue';
import { ref } from 'vue';

const route = useRoute();
const itemStore = useItemStore();
const itemId = route.params.id;
const errorMessage = ref('');

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
    errorMessage.value = 'Failed to toggle favorite status';
  }
};
</script>

<style scoped>
@import '../styles/components/FavoriteBtn.css';
</style>