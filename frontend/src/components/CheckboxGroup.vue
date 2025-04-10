<template>
  <div class="checkbox-group">
    <label class="checkbox-label select-all">
      <input
        type="checkbox"
        id ="select-all"
        name ="select-all"
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
        :id="getValue(option)"
        :name="getValue(option)"
        type="checkbox"
        :value="getValue(option)"
        v-model="localValue"
        @change="updateValue"
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

const localValue = ref([])

watch(() => props.modelValue, (newVal) => {
  if (JSON.stringify(newVal) !== JSON.stringify(localValue.value)) {
    localValue.value = [...newVal]
  }
}, { immediate: true, deep: true })

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
    localValue.value = []
  } else {
    localValue.value = props.options.map(getValue)
  }
  emit('update:modelValue', [...localValue.value])
}

const updateValue = () => {
  emit('update:modelValue', [...localValue.value])
}

watch(() => props.options, () => {
  const validValues = props.options.map(getValue)
  localValue.value = localValue.value.filter(val => validValues.includes(val))
  emit('update:modelValue', [...localValue.value])
}, { deep: true })
</script>

<style scoped>
@import '../styles/components/CheckboxGroup.css';
</style>