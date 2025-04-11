<template>
  <div v-if="loading" class="state loading">
    <p>{{ loadingMessage }}</p>
  </div>
  <div v-else-if="error" class="state error">
    <div class="error-icon">⚠️</div>
    <p>{{ error }}</p>
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
  }
});
</script>

<style scoped>
@import '../styles/components/LoadingState.css';
</style>