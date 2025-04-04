<template>
    <div class="FilterPanel">
      <!-- Categories -->
      <div>
        <h3 class="filter-headers">{{ t("FilterPanel.Categories") }}</h3>
        <CheckboxGroup
          :options="categories.map(c => c.name)"
          v-model="selectedCategoryNames"
        />
      </div>
  
      <!-- Price Range -->
      <div class="price-range">
        <h3 class="filter-headers">{{ t("FilterPanel.Price-range") }}</h3>
        <div class="price-inputs">
          <div class="price-input">
            <label>{{ t("FilterPanel.Min-price") }}</label>
            <input
              type="number"
              v-model.number="priceMin"
              min="0"
              placeholder="0"
              @input="validatePriceInput"
            />
          </div>
  
          <div class="price-input">
            <label>{{ t("FilterPanel.Max-price") }}</label>
            <input
              type="number"
              v-model.number="priceMax"
              min="0"
              placeholder="10000000"
              @input="validatePriceInput"
            />
          </div>
        </div>
        <p v-if="priceError" class="price-error">{{ priceError }}</p>
      </div>
  
      <!-- Distance -->
      <div class="distance-section">
        <h3 class="filter-headers">{{ t("FilterPanel.Distance") }}</h3>
        <input
          type="number"
          v-model.number="distanceKm"
          min="0"
          placeholder="Distance in km"
        />
      </div>
  
      <CustomButton
        @click="applyFilters"
        class="apply-filters-button"
        :disabled="!!priceError"
      >
        {{ t("FilterPanel.Apply-filters") }}
      </CustomButton>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import CheckboxGroup from '@/components/CheckboxGroup.vue'
  import CustomButton from '@/components/CustomButton.vue'
  
  // Props
  const props = defineProps({
    categories: {
      type: Array,
      default: () => []
    },
    latitude: Number,
    longitude: Number
  })
  
  const emit = defineEmits(['applyFilters'])
  const { t } = useI18n()
  
  const selectedCategoryNames = ref([])
  const priceMin = ref('')
  const priceMax = ref('')
  const distanceKm = ref('')
  const MAX_PRICE = 10_000_000
  
  const validatePriceInput = () => {
    if (priceMin.value > MAX_PRICE) priceMin.value = MAX_PRICE
    if (priceMax.value > MAX_PRICE) priceMax.value = MAX_PRICE
    if (priceMin.value < 0) priceMin.value = 0
    if (priceMax.value < 0) priceMax.value = 0
  }
  
  const priceError = computed(() => {
    if (priceMin.value && priceMax.value && priceMin.value > priceMax.value) {
      return 'Min price cannot be greater than max price.'
    }
    return ''
  })
  
  const applyFilters = () => {
    const selectedCategoryIds = props.categories
      .filter(c => selectedCategoryNames.value.includes(c.name))
      .map(c => c.id)
  
    emit('applyFilters', {
      categories: selectedCategoryIds,
      priceMin: priceMin.value,
      priceMax: priceMax.value,
      latitude: props.latitude,
      longitude: props.longitude,
      distanceKm: distanceKm.value
    })
  }
  </script>
  
  <style scoped>
  @import '../styles/components/FilterPanel.css';
  </style>
  