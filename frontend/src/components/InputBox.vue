<template>
  <div class="InputBox">
    <input
      :type="type"
      :id="id"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      class="InputBox-input"
    />
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  type: {
    type: String,
    default: 'text'
  },
  id: String,
  placeholder: String,
  required: Boolean,
  disabled: Boolean
});

defineEmits(['update:modelValue']);
</script>

<style scoped>
@import '../styles/InputBox.css';
</style>
