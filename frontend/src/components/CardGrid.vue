<template>
  <div :class="['card-grid', variantClass]">
    <component
      v-for="item in items"
      :is="cardComponent"
      :key="item.id || item.item?.id || item.withUserId"
      v-bind="{ [propName]: item }"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    required: true
  },
  cardComponent: {
    type: [Object, String],
    required: true
  },
  variant: {
    type: String,
    default: 'default'
  },
  propName: {
    type: String,
    default: 'item'
  }
})

const variantClass = computed(() => {
  const classes = {
    compact: 'card-grid--compact',
    messages: 'card-grid--messages',
    default: ''
  }
  return classes[props.variant] || ''
})
</script>


<style scoped>
@import '../styles/components/CardGrid.css';
@import '../styles/components/ItemFormButton.css';
</style>