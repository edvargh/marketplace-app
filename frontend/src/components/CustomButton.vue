<template>
    <button class="custom-button" :type="type" @click="$emit('click')" :disabled="disabled">
      <slot />
    </button>
  </template>
  
  <script setup>
  defineProps({
    type: {
      type: String,
      default: 'button',
    },
    disabled: {
      type: Boolean,
      default: false,
    }
  })
  
  defineEmits(['click'])
  </script>
  
<style scoped>
@import '../styles/components/CustomButton.css';
</style>
  