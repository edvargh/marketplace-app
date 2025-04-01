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
        :key="option"
        class="checkbox-label"
      >
        <input
          type="checkbox"
          :value="option"
          v-model="localValue"
        />
        {{ option }}
      </label>
    </div>
  </template>
  
  <script setup>
  import { computed, watch, toRef } from 'vue'
  import { useI18n } from 'vue-i18n'

  const { t } = useI18n()
  
  const props = defineProps({
    options: { type: Array, required: true },
    modelValue: { type: Array, required: true },
  })
  const emit = defineEmits(['update:modelValue'])
  
  const localValue = toRef(props, 'modelValue')
  
  const allSelected = computed(() =>
    props.options.length > 0 &&
    props.options.every(opt => props.modelValue.includes(opt))
  )
  
  const toggleAll = () => {
    if (allSelected.value) {
      emit('update:modelValue', [])
    } else {
      emit('update:modelValue', [...props.options])
    }
  }
  
  watch(localValue, (newVal) => {
    emit('update:modelValue', newVal)
  })
  </script>

<style>
@import '../styles/components/CheckBoxGroup.css';
</style>