<template>
  <div class="InputBox-wrapper" ref="dropdownRef">
    <div class="InputBox SelectBox" @click="isOpen = !isOpen">
      <input
          type="text"
          class="InputBox-input"
          readonly
          :value="displayValue"
          :placeholder="placeholder"
      />
      <span class="dropdown-arrow">▼</span>
    </div>

    <ul v-if="isOpen" class="custom-dropdown-menu">
      <li
          v-for="option in options"
          :key="getOptionValue(option)"
          @click="selectOption(option)"
      >
        {{ getOptionLabel(option) }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
  options: {
    type: Array,
    default: () => []
  },
  placeholder: String,
  modelValue: [String, Number, Object],
  optionLabel: {
    type: String,
    default: 'label'
  },
  optionValue: {
    type: String,
    default: 'value'
  },
  categoryId: [String, Number]
});

const emit = defineEmits(['update:modelValue']);
const isOpen = ref(false);
const dropdownRef = ref(null);

const displayValue = computed(() => {
  if (!props.modelValue) return '';
  const selected = props.options.find(option =>
      getOptionValue(option) === props.modelValue
  );
  return selected ? getOptionLabel(selected) : props.modelValue;
});

const getOptionLabel = (option) => {
  return option[props.optionLabel] || option;
};

const getOptionValue = (option) => {
  return option[props.optionValue] || option;
};

const selectOption = (option) => {
  const value = getOptionValue(option);
  emit('update:modelValue', value);
  isOpen.value = false;
};

watch(() => props.categoryId, (newValue, oldValue) => {
  if (newValue !== oldValue && oldValue !== undefined) {
    emit('update:modelValue', '');
  }
}, { immediate: false });

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
@import '../styles/components/SelectBox.css';
</style>