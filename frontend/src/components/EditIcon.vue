<template>
    <img
      src="/edit-icon.png"
      alt="Edit"
      class="edit-icon"
      @click="$emit('click')"
    />
  </template>


<script setup>
defineEmits(['click']) 
</script>

<style scoped>
@import '../styles/components/EditIcon.css';
</style>