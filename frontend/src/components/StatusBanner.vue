<template>
  <div class="status-banner">
    {{ formattedStatus }}
  </div>
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