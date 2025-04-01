<template>
  <div class="InputBox box">
    <input
      :type="type"
      :id="id"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      :class="['InputBox-input', { 'input-error-border': hasError }]"
    />
    <slot></slot>
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
  disabled: Boolean,
  hasError: Boolean
});

defineEmits(['update:modelValue']);
</script>

<style scoped>
@import '../styles/components/InputBox.css';
</style>
