<template>
  <router-link :to="{ name: 'ItemView', params: { id: item.id } }" class="item-card-link">
    <div class="item-card">
      <div class="card-image-container">
        <img 
          :src="item.imageUrls && item.imageUrls.length > 0 ? item.imageUrls[0] : '/no-image.png'" 
          alt="Item Image" 
          class="card-image"
          @error="handleImageError" 
        />
      </div>
      
      <div class="card-content">
        <div class="card-header">
          <div class="profile-badge">
            <img 
              :src="sellerProfilePicture" 
              alt="Profile Image" 
              class="profile-image"
              @error="handleProfileImageError" 
            />
          </div>
          <div class="card-header-details">
            <h3 class="title">{{ item.title }}</h3>
          </div>
        </div>
        
        <div class="card-footer">
          <div class="price-frame">
            <span class="price-label">Price</span>
            <span class="price">{{ item.price }} kr</span>
          </div>
          
          <StatusBanner :status="item.status" class="status-banner" />
        </div>
      </div>
    </div>
  </router-link>
</template>

<script setup>
import StatusBanner from "@/components/StatusBanner.vue";
import { ref, onMounted, watch } from 'vue';
import { useUserStore } from "@/stores/userStore";

const userStore = useUserStore();
const sellerProfilePicture = ref('/default-picture.jpg');

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  seller: {
    type: Object,
    default: null
  }
});

// Handle broken item images
const handleImageError = (e) => {
  e.target.src = '/no-image.png';
};

// Handle broken profile images
const handleProfileImageError = (e) => {
  e.target.src = '/default-picture.jpg';
};

// Watch for seller changes from parent
watch(() => props.seller, (newSeller) => {
  if (newSeller?.profilePicture) {
    sellerProfilePicture.value = newSeller.profilePicture;
  }
}, { immediate: true });

// If no seller is provided, fetch it
const fetchSellerData = async () => {
  if (!props.seller && props.item.sellerId) {
    try {
      const seller = await userStore.getUserById(props.item.sellerId);
      if (seller?.profilePicture) {
        sellerProfilePicture.value = seller.profilePicture;
      }
    } catch (err) {
      console.warn('Could not fetch seller profile picture:', err);
    }
  }
};

onMounted(fetchSellerData);
</script>

<style scoped>
@import '../styles/components/CompactItemCard.css';
</style>