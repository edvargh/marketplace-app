<template>
  <div class="reserve-box" :class="{ 'seller-view': isSellerView }">
    <div class="seller-options">
      <h3>Reservation Request</h3>
      <p>{{ buyerName }} wants to reserve this item</p>
      <div class="button-group">
        <button @click="acceptReservation" class="accept-btn">Accept</button>
        <button @click="declineReservation" class="decline-btn">Decline</button>
      </div>
    </div>
    <div class="buyer-view">
      <h3>Reservation Request Sent</h3>
      <p>Waiting for seller to respond...</p>
      <div v-if="status === 'declined'" class="declined-notice">
        <p>Seller declined your reservation request</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/userStore'

const props = defineProps({
  itemId: {
    type: Number,
    required: true
  },
  buyerId: {
    type: Number,
    required: true
  },
  buyerName: {
    type: String,
    required: true
  },
  isSellerView: {
    type: Boolean,
    default: false
  },
  initialStatus: {
    type: String,
    default: 'pending'
  }
})

const emit = defineEmits(['status-changed'])
const userStore = useUserStore()
const status = ref(props.initialStatus)

const acceptReservation = async () => {
  try {
    // 1. Call backend to update status
    const success = await messageStore.updateReservationStatus(props.messageId, 'ACCEPTED');

    if (success) {
      // 2. Update local state
      status.value = 'ACCEPTED';
      emit('status-changed', 'ACCEPTED');
    }
  } catch (error) {
    console.error('Acceptance failed:', error);
  }
};

const declineReservation = async () => {
  try {
    const success = await messageStore.updateReservationStatus(props.messageId, 'DECLINED');
    if (success) {
      status.value = 'DECLINED';
      emit('status-changed', 'DECLINED');
    }
  } catch (error) {
    console.error('Decline failed:', error);
  }
};
</script>

<style scoped>
.reserve-box {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
  background-color: #f9f9f9;
}

.seller-view {
  background-color: #fff8e1;
}

h3 {
  margin-top: 0;
  color: #333;
}

.button-group {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.accept-btn {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.decline-btn {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.declined-notice {
  color: #f44336;
  margin-top: 8px;
  font-weight: bold;
}
</style>