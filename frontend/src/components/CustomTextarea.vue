<template>
    <div class="CustomTextarea box">
      <textarea
        ref="textareaRef"
        class="custom-textarea"
        :placeholder="placeholder"
        :value="modelValue"
        @input="handleInput"
        rows="4"
        :disabled="disabled"
        :required="required"
      ></textarea>
    </div>
  </template>
  
  <script setup>
  import { ref, watch, onMounted, nextTick } from 'vue'
  
  const props = defineProps({
    modelValue: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    required: {
      type: Boolean,
      default: false
    }
  })
  
  const emit = defineEmits(['update:modelValue'])
  
  const textareaRef = ref(null)
  
  const handleInput = (event) => {
    emit('update:modelValue', event.target.value)
    autoResize()
  }
  
  const autoResize = () => {
    if (textareaRef.value) {
      textareaRef.value.style.height = 'auto'
      textareaRef.value.style.height = textareaRef.value.scrollHeight + 'px'
    }
  }
  
  watch(() => props.modelValue, () => {
    nextTick(autoResize)
  })
  
  onMounted(() => {
    autoResize()
  })
  </script>
  
  <style scoped>
  @import '../styles/CustomTextarea.css';
  </style>