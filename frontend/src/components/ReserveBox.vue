<template>
  <div class="reserve-box" :class="{ 'seller-view': isSellerView, 'in-message': true }">
    <!-- Seller View -->
    <div v-if="isSellerView" class="seller-options">
      <h3>Reservation Request</h3>
      <p>{{ buyerName }} wants to reserve this item</p>
      <div v-if="!hideButtons" class="button-group">
        <button @click="$emit('accept')" :disabled="disabled" class="action-button button-primary">
          Accept
        </button>
        <button @click="$emit('decline')" :disabled="disabled" class="action-button button-danger">
          Decline
        </button>
      </div>
      <p v-if="initialStatus === 'ACCEPTED'" class="status-indicator accepted">
        ✓ Reservation accepted
      </p>
      <p v-else-if="initialStatus === 'DECLINED'" class="status-indicator declined">
        ✗ Reservation declined
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
      <button v-if="showCancel" @click="$emit('cancel')" class="action-button button-cancel this-cancel">
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
  },
  hideButtons: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

defineEmits(['accept', 'decline', 'cancel'])
</script>

<style scoped>
@import '../styles/components/ReserveBox.css';
</style>