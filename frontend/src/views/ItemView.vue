<template>
  <div v-if="loading" class="loading">
    Loading item details...
  </div>
  <div v-else-if="error" class="error">
    {{ error }}
  </div>

  <div v-else class="item-detail-container">
    <!-- Image Gallery -->
    <ImageGallery
        :images="item.imageUrls || []"
        :alt-text="item.title"
        class="image-gallery"
    />

    <!-- Item Info -->
    <div class="item-info">
      <h1>{{ item.title }}</h1>

      <div class="overview-content">
        <div class="price-status">
          <span class="price">{{ item.price }} kr</span>
          <span class="status">{{ item.status }}</span>
        </div>
        <FavoriteBtn v-if="!isMyItem" />
      </div>


      <div class="action-buttons">
        <template v-if="!isMyItem">
          <button class="message-btn">Send message</button>
          <button class="reserve-btn">Reserve item</button>
          <button class="blue-btn">Buy Now</button>
        </template>
        <button v-else class="blue-btn">Edit Item</button>
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
          <img src="/default-picture.jpg" alt="Profile Image" class="profile-image" />
        </div>
        <span>{{ item.sellerName }}</span>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import ImageGallery from "@/components/ImageGallery.vue";
import { useItemStore } from "@/stores/itemStore";
import { useUserStore } from "@/stores/userStore";
import FavoriteBtn from "@/components/FavoriteBtn.vue";

const route = useRoute();
const itemStore = useItemStore();
const userStore = useUserStore();
const item = ref({});
const loading = ref(true);
const error = ref(null);
const isMyItem = ref(false);

onMounted(async () => {
  try {
    loading.value = true;
    const itemId = route.params.id;

    if (!itemId) {
      throw new Error('No item ID provided');
    }

    const itemData = await itemStore.fetchItemById(itemId);

    if (itemData) {
      item.value = itemData;
      isMyItem.value = userStore.user?.id === itemData.sellerId;

    } else {
      throw new Error('Item not found');
    }
  } catch (err) {
    console.error('Error fetching item details:', err);
    error.value = err.message || 'Failed to load item details';

  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
@import '../styles/views/ItemView.css';
</style>