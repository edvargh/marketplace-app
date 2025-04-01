<template>
  <router-link :to="{ name: 'ItemView', params: { id: item.id } }" class="item-card-link">
    <div class="item-card">
      <div class="status-banner">
        {{ item.status }}
      </div>

      <div class="card-image-container">
        <img :src="item.imageUrls && item.imageUrls.length > 0 ? item.imageUrls[0] : '/no-image.png'" alt="Image" class="card-image" />

        <div class="profile-badge">
          <img src="/default-picture.jpg" alt="Profile Image" class="profile-image" />
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

      </div>
    </div>
  </router-link>
</template>


<script setup>
defineProps({
  item: {
    type: Object,
    required: true
  }
})

</script>


<style scoped>
@import '../styles/components/DetailedItemCard.css';
</style>


