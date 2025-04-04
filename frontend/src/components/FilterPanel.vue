<template>
  <div class="FilterPanel">
    <!-- Categories -->
    <div>
      <h3 class="filter-headers">{{ t("FilterPanel.Categories") }}</h3>
      <CheckboxGroup
        :options="categories"
        v-model="selectedCategoryIds"
        option-label="name"
        option-value="id"
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
        class="geo-input"
      />
    </div>

    <!-- Location -->
    <div class="location-section">
      <h3 class="filter-headers">Latitude & Longitude</h3>
      <div class="geo-inputs">
        <div class="geo-input-wrapper">
          <label>Latitude</label>
          <input
            type="number"
            v-model.number="latitude"
            placeholder="Latitude"
            class="geo-input"
          />
        </div>
        <div class="geo-input-wrapper">
          <label>Longitude</label>
          <input
            type="number"
            v-model.number="longitude"
            placeholder="Longitude"
            class="geo-input"
          />
        </div>
      </div>
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
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useFilterStore } from '@/stores/filterStore'
import CheckboxGroup from '@/components/CheckboxGroup.vue'
import CustomButton from '@/components/CustomButton.vue'

const props = defineProps({
  categories: { type: Array, default: () => [] }
})

const emit = defineEmits(['applyFilters'])
const { t } = useI18n()

const store = useFilterStore()

// Computed binding to Pinia
const selectedCategoryIds = computed({
  get: () => store.selectedCategoryIds,
  set: val => store.selectedCategoryIds = val
})
const priceMin = computed({
  get: () => store.priceMin,
  set: val => store.priceMin = val
})
const priceMax = computed({
  get: () => store.priceMax,
  set: val => store.priceMax = val
})
const distanceKm = computed({
  get: () => store.distanceKm,
  set: val => store.distanceKm = val
})
const latitude = computed({
  get: () => store.latitude,
  set: val => store.latitude = val
})
const longitude = computed({
  get: () => store.longitude,
  set: val => store.longitude = val
})

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
  emit('applyFilters', {
    categories: selectedCategoryIds.value,
    priceMin: priceMin.value,
    priceMax: priceMax.value,
    distanceKm: distanceKm.value,
    latitude: latitude.value,
    longitude: longitude.value
  })
}
</script>

<style>
@import "../styles/components/FilterPanel.css";
</style>