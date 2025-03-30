<template>
  <div class="item-detail-container">
    <!-- Image Gallery -->
    <ImageGallery
        :images="item.images"
        :alt-text="item.title"
        class="image-gallery"
    />

    <!-- Item Info -->
    <div class="item-info">
      <h1>{{ item.title }}</h1>

      <div class="price-status">
        <span class="price">{{ item.price }} kr</span>
        <span v-if="item.status" class="status">{{ item.status }}</span>
      </div>

      <div class="location">
        <span>{{ item.location }}</span>
      </div>

      <div class="action-buttons">
        <button class="message-btn">Send message</button>
        <button class="reserve-btn">Reserve item</button>
        <button class="buy-btn">Buy Now</button>
      </div>
    </div>

    <!-- Description Section -->
    <div class="description">
      <h3>Description of the item</h3>
      <p>{{ item.description }}</p>
    </div>

    <!-- Seller Info -->
    <div class="seller-info">
      <h3>Seller</h3>
      <div class="seller">
        <div class="profile-badge">
          <img :src="item.seller.avatar" alt="Profile Image" class="profile-image" />
        </div>
        <span>{{ item.seller.name }}</span>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, computed, onMounted } from 'vue';
import ImageGallery from "@/components/ImageGallery.vue";

const item = ref({
  title: 'Vintage Camera Collection',
  description: 'Excellent condition vintage cameras from the 1980s. Perfect for collectors.',
  price: 1299,
  location: '7030 Trondheim',
  status: 'Reserved',
  images: [
    '/sports.jpg',
    '/houses.jpg',
    '/kitchen-items.jpg'
  ],
  seller: {
    name: 'Alex Johnson',
    avatar: '/default-picture.jpg'
  }
});

const currentImageIndex = ref(0);
const error = ref(null);

const currentImage = computed(() => {
  if (item.value.images && item.value.images.length > 0) {
    return item.value.images[currentImageIndex.value];
  }
  return '';
});

function nextImage() {
  if (item.value.images.length > 0) {
    currentImageIndex.value = (currentImageIndex.value + 1) % item.value.images.length;
  }
}

function prevImage() {
  if (item.value.images.length > 0) {
    currentImageIndex.value = (currentImageIndex.value - 1 + item.value.images.length) % item.value.images.length;
  }
}

/*
const route = useRoute();
const item = ref({
  title: '',
  description: '',
  price: 0,
  location: '',
  status: '',
  images: [],
  seller: {
    name: '',
    avatar: ''
  }
});
const currentImageIndex = ref(0);
const loading = ref(true);
const error = ref(null);

const currentImage = computed(() => {
  if (item.value.images && item.value.images.length > 0) {
    return item.value.images[currentImageIndex.value];
  }
  return '';
});

onMounted(async () => {
  try {
    console.log("Fetching item ...")
    const response = await fetch(`http://localhost:8080/api/items/${route.params.id}`);
    console.log("Success fetching item ...")

    if (!response.ok) {
      throw new Error('Item not found');
    }

    const data = await response.json();
    item.value = data;

    if (!item.value.images || item.value.images.length === 0) {
      item.value.images = ['/no-photo.jpg'];
    }

  } catch (err) {
    error.value = err.message;
    console.error('Error fetching item:', err);
  } finally {
    loading.value = false;
  }
});

function nextImage() {
  if (item.value.images.length > 0) {
    currentImageIndex.value = (currentImageIndex.value + 1) % item.value.images.length;
  }
}

function prevImage() {
  if (item.value.images.length > 0) {
    currentImageIndex.value = (currentImageIndex.value - 1 + item.value.images.length) % item.value.images.length;
  }
}
*/
</script>

<style scoped>
@import '../styles/ItemView.css';
</style>