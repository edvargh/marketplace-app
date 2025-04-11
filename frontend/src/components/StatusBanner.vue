<template>
  <span class="status-banner">
    {{ formattedStatus }}
  </span>
</template>

<script setup>
import { computed } from "vue";
import { useI18n } from 'vue-i18n';

const props = defineProps({
  status: {
    type: String,
    required: true
  }
});

const { t } = useI18n();

const formattedStatus = computed(() => {
  switch (props.status) {
    case 'SOLD':
      return t('status.sold');
    case 'RESERVED':
      return t('status.reserved');
    case 'FOR_SALE':
      return t('status.forSale');
    default:
      return props.status.replace(/_/g, ' ');
  }
});

</script>

<style scoped>
@import '../styles/components/StatusBanner.css';
</style>