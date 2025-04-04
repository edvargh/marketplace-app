<template>
  <div class="reserve-box" :class="{ 'seller-view': isSellerView, 'in-message': true }">
    <!-- Seller View -->
    <div v-if="isSellerView" class="seller-options">
      <h3>Reservation Request</h3>
      <p>{{ buyerName }} wants to reserve this item</p>
      <div class="button-group">
        <button
          @click="$emit('accept')"
          class="action-button accept-button"
          :disabled="initialStatus !== 'PENDING'"
        >
          Accept
        </button>
        <button
          @click="$emit('decline')"
          class="action-button decline-button"
          :disabled="initialStatus !== 'PENDING'"
        >
          Decline
        </button>
      </div>
      <p v-if="initialStatus === 'ACCEPTED'" class="status-indicator accepted">
        ✓ Reservation Accepted
      </p>
      <p v-else-if="initialStatus === 'DECLINED'" class="status-indicator declined">
        ✗ Reservation Declined
      </p>
    </div>

    <!-- Buyer View -->
    <div v-else class="buyer-view">
      <h3>Reservation Request</h3>
      <p v-if="initialStatus === 'PENDING'">Waiting for seller to respond...</p>
      <p v-else-if="initialStatus === 'ACCEPTED'" class="accepted-notice">
        The seller has accepted your reservation request!
      </p>
      <p v-else-if="initialStatus === 'DECLINED'" class="declined-notice">
        Seller declined your reservation request
      </p>
      <button v-if="showCancel" @click="$emit('cancel')" class="cancel-button">
        Cancel
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  itemId: Number,
  buyerId: Number,
  buyerName: String,
  isSellerView: Boolean,
  initialStatus: {
    type: String,
    default: 'PENDING'
  },
  reservationMessage: String,
  showCancel: {
    type: Boolean,
    default: false
  }
})

defineEmits(['accept', 'decline', 'cancel'])
</script>

<style scoped>
.reserve-box {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  background-color: #CEEBF4;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  margin-bottom: 10px;
  width: 100%;
}

.reserve-box.in-message {
  /* Styles specific to when displayed in a message */
  min-width: 220px;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 0;
}

.seller-view {
  background-color: #CEEBF4;
}

h3 {
  margin-top: 0;
  margin-bottom: 8px;
  color: #333;
  font-weight: 600;
  font-size: 1rem;
}

.button-group {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.action-button {
  padding: 6px 12px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s ease;
  font-size: 0.9rem;
}

.action-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.accept-button {
  background-color: #4caf50;
  color: white;
}

.accept-button:hover:not(:disabled) {
  background-color: #3d9140;
}

.decline-button {
  background-color: #f44336;
  color: white;
}

.decline-button:hover:not(:disabled) {
  background-color: #d32f2f;
}

.cancel-button {
  padding: 6px 12px;
  border-radius: 4px;
  border: none;
  background-color: #f0f0f0;
  color: #333;
  cursor: pointer;
  font-weight: 500;
  margin-top: 8px;
  font-size: 0.9rem;
}

.cancel-button:hover {
  background-color: #e0e0e0;
}

.reservation-message {
  font-style: italic;
  margin: 8px 0;
  font-size: 0.9rem;
}

.accepted-notice {
  color: #4caf50;
  font-weight: 500;
}

.declined-notice {
  color: #f44336;
  font-weight: 500;
}

.status-indicator {
  margin-top: 8px;
  font-size: 0.9rem;
  font-weight: 500;
}

.status-indicator.accepted {
  color: #4caf50;
}

.status-indicator.declined {
  color: #f44336;
}

/* Adjust font sizes for message context */
.in-message p {
  font-size: 0.9rem;
  margin: 4px 0;
}

.in-message h3 {
  font-size: 0.95rem;
}
</style>