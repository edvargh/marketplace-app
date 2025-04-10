<template>
  <div class="user-warning" v-if="message">
    <slot>
      {{ message }}
    </slot>
  </div>
</template>

<script setup>
const props = defineProps({
  message: {
    type: String,
    default: ''
  }
})
</script>