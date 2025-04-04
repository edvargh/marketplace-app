<template>
  <div class="checkbox-group">
    <label class="checkbox-label select-all">
      <input
        type="checkbox"
        :checked="allSelected"
        @change="toggleAll"
      />
      {{ t('FilterPanel.Select-all') }}
    </label>
    
    <label
      v-for="option in options"
      :key="getValue(option)"
      class="checkbox-label"
    >
      <input
        type="checkbox"
        :value="getValue(option)"
        v-model="localValue"
      />
      {{ getLabel(option) }}
    </label>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  options: { type: Array, required: true },
  modelValue: { type: Array, required: true },
  optionLabel: { type: String, default: 'label' },
  optionValue: { type: String, default: 'value' }
})

const emit = defineEmits(['update:modelValue'])

// Use local ref instead of toRef for modelValue to prevent direct mutation
const localValue = ref([...props.modelValue])

const getLabel = (option) =>
  typeof option === 'object' ? option[props.optionLabel] : option

const getValue = (option) =>
  typeof option === 'object' ? option[props.optionValue] : option

const allSelected = computed(() =>
  props.options.length > 0 &&
  props.options.every(opt => localValue.value.includes(getValue(opt)))
)

const toggleAll = () => {
  if (allSelected.value) {
    emit('update:modelValue', [])
    localValue.value = []
  } else {
    const all = props.options.map(getValue)
    emit('update:modelValue', all)
    localValue.value = [...all]
  }
}

// Update local value when modelValue changes
watch(
  () => props.modelValue,
  (newVal) => {
    localValue.value = [...newVal]
  }
)

// Update local value when options change
watch(
  () => props.options,
  () => {
    // Ensure we maintain valid selections when options change
    const validValues = props.options.map(getValue)
    const filteredValues = localValue.value.filter(val => validValues.includes(val))
    localValue.value = filteredValues
    emit('update:modelValue', filteredValues)
  }
)

// Emit changes when localValue changes
watch(
  localValue,
  (newVal) => {
    emit('update:modelValue', [...newVal])
  },
  { deep: true }
)
</script>

<style scoped>
@import '../styles/components/CheckBoxGroup.css';
</style>