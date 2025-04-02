<template>
  <div v-if="loading" class="loading">
    <p>{{ loadingMessage }}</p>
  </div>
  <div v-else-if="error" class="error">
    <div class="error-icon">⚠️</div>
    <p>{{ error }}</p>
    <button v-if="showRetry" @click="$emit('retry')" class="retry-button">
      Try Again
    </button>
  </div>
</template>

<script setup>
defineProps({
  loading: Boolean,
  error: {
    type: String,
    default: "Something went wrong. Please try again.",
  },
  loadingMessage: {
    type: String,
    default: "Loading...",
  },
  showRetry: {
    type: Boolean,
    default: true
  }
});

defineEmits(['retry']);
</script>

<style scoped>
@import '../styles/components/LoadingState.css';
</style>