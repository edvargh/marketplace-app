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

    <FavoriteBtn v-if="showFavoriteButton" />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import FavoriteBtn from "@/components/FavoriteBtn.vue";

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
    default: false
  },
  currentIndex: {
    type: Number,
    default: 0
  }
});

const currentImageIndex = ref(props.currentIndex);

watch(() => props.currentIndex, (newIndex) => {
  if (newIndex >= 0 && newIndex < props.images.length) {
    currentImageIndex.value = newIndex;
  }
});

const currentImage = computed(() => {
  if (props.images.length > 0 && currentImageIndex.value < props.images.length) {
    const image = props.images[currentImageIndex.value];
    return typeof image === 'object' && image.url ? image.url : image;
  }
  return '';
});

function nextImage() {
  if (props.images.length > 1) {
    currentImageIndex.value = (currentImageIndex.value + 1) % props.images.length;
    emit('update:currentIndex', currentImageIndex.value);
  }
}

function prevImage() {
  if (props.images.length > 1) {
    currentImageIndex.value = (currentImageIndex.value - 1 + props.images.length) % props.images.length;
    emit('update:currentIndex', currentImageIndex.value);
  }
}

const emit = defineEmits(['update:currentIndex']);
</script>

<style scoped>
@import '../styles/components/ImageGallery.css';
</style>