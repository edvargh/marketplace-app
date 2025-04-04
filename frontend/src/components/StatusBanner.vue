<template>
  <span class="status-banner">
    {{ formattedStatus }}
  </span>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  status: {
    type: String,
    required: true
  }
});

const formattedStatus = computed(() => {
  return props.status.replace(/_/g, ' ');
});
</script>

<style scoped>
@import '../styles/components/StatusBanner.css';
</style>