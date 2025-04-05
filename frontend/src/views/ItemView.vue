<template>
  <LoadingState :loading="loading" :error="error" loadingMessage="Loading advertisement..."/>

  <div v-if="!loading && !error" class="item-detail-container">
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
          <StatusBanner :status="item.status" />
        </div>
        <FavoriteBtn v-if="!isMyItem" :isFavorite="isFavorite" @update:isFavorite="updateFavoriteStatus" />
      </div>

      <div class="action-buttons">
        <template v-if="!isMyItem">
          <button class="message-btn" @click="handleMessageSeller">Send message</button>
          <button class="reserve-btn" @click="handleReserveItem">Reserve item</button>
          <button class="blue-btn">Buy Now</button>
        </template>
        <router-link v-else :to="{ name: 'EditItemView', params: { id: item.id } }" class="blue-btn">
          Edit Item
        </router-link>
      </div>
    </div>

    <!-- Description Section -->
    <div class="description">
      <h3>Description of the item</h3>
      <p>{{ item.description }}</p>
    </div>

    <!-- Location -->
    <LocationDisplay
        :lat="item.latitude"
        :lng="item.longitude"
    />

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
import { useRoute, useRouter } from 'vue-router';
import ImageGallery from "@/components/ImageGallery.vue";
import { useItemStore } from "@/stores/itemStore";
import { useUserStore } from "@/stores/userStore";
import { useMessageStore } from '@/stores/messageStore';
import FavoriteBtn from "@/components/FavoriteBtn.vue";
import LoadingState from "@/components/LoadingState.vue";
import LocationDisplay from "@/components/LocationDisplay.vue";
import StatusBanner from "@/components/StatusBanner.vue";

const route = useRoute();
const itemStore = useItemStore();
const userStore = useUserStore();
const item = ref({});
const loading = ref(true);
const error = ref(null);
const isMyItem = ref(false);
const isFavorite = ref(false);
const router = useRouter();
const messageStore = useMessageStore();

onMounted(async () => {
  loading.value = true;
  try {
    const itemId = route.params.id;

    if (!itemId) {
      throw new Error('No item ID provided');
    }

    const itemData = await itemStore.fetchItemById(itemId);

    if (itemData) {
      item.value = itemData;
      isMyItem.value = userStore.user?.id === itemData.sellerId;
      const favoriteItems = await itemStore.fetchUserFavoriteItems();
      isFavorite.value = favoriteItems.some(item => item.id === parseInt(itemId));

    if (!isMyItem.value) {
      await itemStore.logItemView(itemId);
      }
    } else {
      throw new Error('Item not found');
    }
  } catch (e) {
    error.value = "Could not load this advertisement. Please try again.";
  } finally {
    loading.value = false;
  }
});

const props = defineProps({
  id: {
    type: String,
    required: false
  }
})

const handleMessageSeller = async () => {
  const itemId = item.value.id;
  const sellerId = item.value.sellerId;

  try {
    await messageStore.ensureConversationExists(itemId, sellerId);

    await router.push({
      name: 'ConversationView',
      query: {
        itemId: itemId.toString(),
        withUserId: sellerId.toString()
      }
    });
  } catch (err) {
    console.error('[ItemView] ❌ Failed to start or find conversation:', err);
    alert("Could not start a conversation with the seller.");
  }
};

const handleReserveItem = async () => {
  try {
    const itemId = item.value.id
    const sellerId = item.value.sellerId

    await messageStore.ensureConversationExists(itemId, sellerId)

    await router.push({
      name: 'ConversationView',
      query: {
        itemId: itemId.toString(),
        withUserId: sellerId.toString(),
        reserve: 'true'
      }
    })
  } catch (err) {
    console.error('Error handling reservation:', err)
    alert("Could not reserve the item. Please try again.")
  }
}


const updateFavoriteStatus = (newStatus) => {
  isFavorite.value = newStatus;
};

</script>

<style scoped>
@import '../styles/views/ItemView.css';
</style>