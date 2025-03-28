<template>
  <div class="item-card">
    <div v-if="item.status" class="status-banner">
      {{ item.status }}
    </div>

    <div class="card-image-container">
      <img :src="item.imageUrl" alt="Image" class="card-image" />

      <div class="profile-badge">
        <img :src="item.profileImageUrl" alt="Profile Image" class="profile-image" />
      </div>

    </div>

    <div class="card-content">
      <div class="card-header">
        <h3 class="title">{{ item.title }}</h3>
        <span class="price">{{ item.price }} kr</span>
      </div>
      <p class="card-description">
        {{ item.description }}
      </p>
      <span class="location">{{ item.location }}</span>

    </div>
  </div>
</template>



<script setup>
// Receive item data
const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

</script>



<style scoped>
@import '../styles/DetailedItemCard.css';
</style>


