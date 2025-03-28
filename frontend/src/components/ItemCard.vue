<script setup>
// Receive item data
const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

</script>



<template>
  <div
      class="item-card"
      :class="{ 'reserved': item.reservedStatus }"
  >
    <div class="card-image-container">
      <img :src="item.imageUrl" alt="Image" class="card-image" />
      <div class="card-badge">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
      </div>
    </div>

    <div class="card-content">
      <div class="card-header">
        <h3>{{ item.title }}</h3>
        <span class="reserved-tag" v-if="item.reservedStatus">Reserved</span>
      </div>

      <div class="card-details">
        <div class="card-info">
          <span class="label">Collection</span>
          <span class="value">{{ item.location }}</span>
        </div>
        <div class="card-info">
          <span class="label">Price</span>
          <span class="value">{{ item.price }} ETH</span>
        </div>
      </div>

      <p class="card-description">
        {{ item.description }}
      </p>
    </div>
  </div>
</template>


<style scoped>
.item-cards-container {
  display: flex;
  gap: 20px;
  justify-content: center;
  padding: 20px;
}

.item-card {
  width: 300px;
  background: linear-gradient(145deg, #f0f4f8, #e6eaf3);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  position: relative;
}

.item-card:hover {
  transform: scale(1.03);
}

.card-image-container {
  position: relative;
  height: 300px;
  background-color: #000;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-badge {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 8px;
  border-radius: 50%;
}

.card-content {
  padding: 15px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.card-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #333;
}

.reserved-tag {
  background-color: #e0e0e0;
  color: #666;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
}

.card-details {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.card-info {
  display: flex;
  flex-direction: column;
}

.label {
  color: #666;
  font-size: 0.8rem;
  margin-bottom: 4px;
}

.value {
  font-weight: bold;
  color: #333;
}

.card-description {
  color: #666;
  font-size: 0.9rem;
  line-height: 1.5;
}

.reserved::after {
  content: 'Reserved';
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
}

</style>