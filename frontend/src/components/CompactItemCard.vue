<template>
  <div class="item-card">
    <div class="card-image-container">
      <img :src="item.image" alt="Image" class="card-image" />

    </div>

    <div class="card-content">

      <div class="card-header">
        <div class="profile-badge">
          <img :src="item.profile" alt="Profile Image" class="profile-image" />
        </div>
        <div class="card-header-details">
          <h3 class="title">{{ item.title }}</h3>
          <span class="location">{{ item.location }}</span>
        </div>
      </div>

      <div class="card-footer">
        <div class="price-frame">
          <label class="price-label">Price</label>
          <span class="price">{{ item.price }} kr</span>
        </div>

        <div v-if="item.status" class="status-banner">
          {{ item.status }}
        </div>
      </div>

    </div>
  </div>
</template>



<script setup>
// Receive item data
defineProps({
  item: {
    type: Object,
    required: true
  }
});
</script>



<style scoped>
@import '../styles/CompactItemCard.css';
</style>


