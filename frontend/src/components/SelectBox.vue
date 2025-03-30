<template>
  <div
      class="InputBox-wrapper"
      ref="dropdownRef"
  >
    <div
        class="InputBox"
        @click="isOpen = !isOpen"
    >
      <input
          type="text"
          class="InputBox-input"
          readonly
          :value="selectedOption || ''"
          :placeholder="placeholder"
      />
      <span class="dropdown-arrow">▼</span>
    </div>

    <ul
        v-if="isOpen"
        class="custom-dropdown-menu"
    >
      <li
          v-for="option in options"
          :key="option"
          @click="selectOption(option)"
      >
        {{ option }}
      </li>
    </ul>
  </div>
</template>


<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
  options: Array,
  placeholder: String,
  modelValue: [String, Number],
  categoryId: [String, Number] // ID of parent category (dependency tracking)
});

const emit = defineEmits(['update:modelValue']);
const isOpen = ref(false);
const selectedOption = ref(props.modelValue);
const dropdownRef = ref(null); // Add this line to create the ref

watch(() => props.modelValue, (newValue) => {
  selectedOption.value = newValue;
});

watch(() => props.categoryId, (newValue, oldValue) => {
  if (newValue !== oldValue && oldValue !== undefined) {
    selectedOption.value = '';
    emit('update:modelValue', '');
  }
}, { immediate: false });

const selectOption = (option) => {
  selectedOption.value = option;
  emit('update:modelValue', option);
  isOpen.value = false;
};

const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>



<style scoped>
@import '../styles/SelectBox.css';
</style>