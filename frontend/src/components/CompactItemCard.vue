<template>
  <router-link :to="{ name: 'ItemView', params: { id: item.id } }" class="item-card-link">
    <div class="item-card">
      <div class="card-image-container">
        <img :src="item.imageUrls && item.imageUrls.length > 0 ? item.imageUrls[0] : '/no-image.png'" alt="Image" class="card-image" />
      </div>

      <div class="card-content">

        <div class="card-header">
          <div class="profile-badge">
            <img src="/default-picture.jpg" alt="Profile Image" class="profile-image" />
          </div>
          <div class="card-header-details">
            <h3 class="title">{{ item.title }}</h3>
          </div>
        </div>

        <div class="card-footer">
          <div class="price-frame">
            <label class="price-label">Price</label>
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

defineProps({
  item: {
    type: Object,
    required: true
  }
});
</script>


<style scoped>
@import '../styles/components/CompactItemCard.css';
</style>


