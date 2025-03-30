<template>
  <div class="InputBox-wrapper">
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
import { ref, watch } from 'vue';

const props = defineProps({
  options: Array,
  placeholder: String,
  modelValue: [String, Number],
  categoryId: [String, Number] // ID of parent category (dependency tracking)
});

const emit = defineEmits(['update:modelValue']);
const isOpen = ref(false);
const selectedOption = ref(props.modelValue);

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
</script>




<style scoped>
@import '../styles/SelectBox.css';
</style>