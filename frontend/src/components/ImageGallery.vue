<template>
  <div class="image-gallery">
    <div class="main-image">
      <img :src="currentImage" :alt="altText">

      <!-- Navigation Arrows -->
      <button class="nav-btn prev-btn" @click="prevImage" v-if="images.length > 1">
        &lt;
      </button>
      <button class="nav-btn next-btn" @click="nextImage" v-if="images.length > 1">
        &gt;
      </button>

      <!-- Image Counter -->
      <div class="image-counter" v-if="images.length > 1">
        {{ currentImageIndex + 1 }} / {{ images.length }}
      </div>
    </div>

    <button class="favorite-btn" v-if="showFavoriteButton">
      <span>❤</span> Add to favorites
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  images: {
    type: Array,
    required: true,
    default: () => []
  },
  altText: {
    type: String,
    default: ''
  },
  showFavoriteButton: {
    type: Boolean,
    default: true
  }
});

const currentImageIndex = ref(0);

const currentImage = computed(() => {
  if (props.images.length > 0) {
    return props.images[currentImageIndex.value];
  }
  return '';
});

function nextImage() {
  if (props.images.length > 0) {
    currentImageIndex.value = (currentImageIndex.value + 1) % props.images.length;
  }
}

function prevImage() {
  if (props.images.length > 0) {
    currentImageIndex.value = (currentImageIndex.value - 1 + props.images.length) % props.images.length;
  }
}
</script>

<style scoped>
@import '../styles/ImageGallery.css';
</style>