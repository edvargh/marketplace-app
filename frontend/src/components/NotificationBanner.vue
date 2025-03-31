<template>
    <transition name="fade">
      <div 
        v-if="isVisible" 
        class="popup-overlay" 
        @click.self="autoClose ? hide() : null"
      >
        <div 
          class="popup-content" 
          :class="type" 
          :style="{ maxWidth: maxWidth }"
        >
          <p class="message">
            <component :is="iconComponent" v-if="iconComponent" class="icon" />
            {{ message }}
          </p>
          <button v-if="showClose" class="close-btn" @click="hide">
            &times;
          </button>

          <component 
            :is="iconComponent" 
            v-if="iconComponent" 
            class="icon"
            :style="{ color: typeColors }"
            >
            {{ type === 'success' ? '✓' : 
               type === 'error' ? '✕' : 
               type === 'warning' ? '!' : 'i' }}
            </component>
        </div>
      </div>
    </transition>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue'
  
  const props = defineProps({
    message: { type: String, required: true },
    type: { 
      type: String, 
      default: 'info',
      validator: (value) => ['success', 'error', 'warning', 'info'].includes(value)
    },
    timeout: { type: Number, default: 3000 },
    autoClose: { type: Boolean, default: true },
    showClose: { type: Boolean, default: true },
    maxWidth: { type: String, default: '400px' }
  })
  
  const emit = defineEmits(['close', 'timeout-complete'])
  
  const isVisible = ref(false)

  const iconComponent = computed(() => {
  const icons = {
    success: 'span',  
    error: 'span',
    warning: 'span',
    info: 'span'
  }
  return icons[props.type]
})
  
  const typeColors = computed(() => {
    const colors = {
      success: '#4ade80',
      error: '#f87171',
      warning: '#fbbf24',
      info: '#60a5fa'
    }
    return colors[props.type]
  })
  
  let timeoutId = null
  
  const show = () => {
    isVisible.value = true
    if (props.autoClose && props.timeout > 0) {
      timeoutId = setTimeout(hide, props.timeout)
    }
  }
  
  const hide = () => {
    isVisible.value = false
    if (timeoutId) clearTimeout(timeoutId)
    emit('close')
    emit('timeout-complete')
  }
  
  onMounted(() => {
    if (props.message) show()
  })
  
  defineExpose({ show, hide })
  </script>

<style>
@import '../styles/NotificationBanner.css';
</style>
