<template>
  <div class="reserve-box" :class="{ 'seller-view': isSellerView, 'in-message': true }">
    <!-- Seller View -->
    <div v-if="isSellerView" class="seller-options">
      <h3> {{t('ReserveBox.reservation-request')}} </h3>
      <p>{{ buyerName }} {{t('ReserveBox.wants-to-reserve')}} </p>
      <div v-if="!hideButtons" class="button-group">
        <button @click="$emit('accept')" :disabled="disabled" class="action-button button-primary">
          {{t('ReserveBox.accept')}}
        </button>
        <button @click="$emit('decline')" :disabled="disabled" class="action-button button-danger">
          {{t('ReserveBox.decline')}}
        </button>
      </div>
      <p v-if="initialStatus === 'ACCEPTED'" class="status-indicator accepted">
        {{ t('ReserveBox.reservation-accepted') }}
      </p>
      <p v-else-if="initialStatus === 'DECLINED'" class="status-indicator declined">
        {{ t('ReserveBox.reservation-declined') }}
      </p>
    </div>

    <!-- Buyer View -->
    <div v-else class="buyer-view">
      <h3>{{t('ReserveBox.reservation-request')}}</h3>
      <p v-if="initialStatus === 'PENDING'">{{ t('ReserveBox.waiting') }}</p>
      <p v-else-if="initialStatus === 'ACCEPTED'" class="accepted-notice">
        {{ t('ReserveBox.seller-accepted') }}
      </p>
      <p v-else-if="initialStatus === 'DECLINED'" class="declined-notice">
        {{ t('ReserveBox.seller-declined') }}
      </p>
      <button v-if="showCancel" @click="$emit('cancel')" class="action-button button-cancel this-cancel">
        {{t('ReserveBox.cancel')}}
      </button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
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