<template>
  <div v-if="loading" class="state loading">
    <p>{{ loadingMessage }}</p>
  </div>
  <div v-else-if="error" class="state error">
    <div class="error-icon">⚠️</div>
    <p>{{ error }}</p>
    <!--TODO: Add button and implement function in views/components that uses this component, or keep as is -->
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