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
            v-model="latitudeInput"
            placeholder="Latitude"
            class="geo-input"
            step="0.000001"
            @change="handleLatLongChange"
          />
        </div>
        <div class="geo-input-wrapper">
          <label>Longitude</label>
          <input
            type="number"
            v-model="longitudeInput"
            placeholder="Longitude"
            class="geo-input"
            step="0.000001"
            @change="handleLatLongChange"
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
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useFilterStore } from '@/stores/filterStore'
import CheckboxGroup from '@/components/CheckboxGroup.vue'
import CustomButton from '@/components/CustomButton.vue'
import { useRoute } from 'vue-router'

const props = defineProps({
  categories: { type: Array, default: () => [] }
})

const emit = defineEmits(['applyFilters'])
const { t } = useI18n()
const route = useRoute()

const store = useFilterStore()
const MAX_PRICE = 10_000_000

const selectedCategoryIds = ref([...store.selectedCategoryIds])
const priceMin = ref(store.priceMin)
const priceMax = ref(store.priceMax)
const distanceKm = ref(store.distanceKm)

const latitudeInput = ref('')
const longitudeInput = ref('')
const latitude = ref(null)
const longitude = ref(null)

onMounted(() => {
  if (route.query.categoryIds) {
    const ids = Array.isArray(route.query.categoryIds) 
      ? route.query.categoryIds 
      : [route.query.categoryIds]
    
    selectedCategoryIds.value = ids.map(id => parseInt(id, 10))
  }
  
  if (route.query.minPrice) priceMin.value = Number(route.query.minPrice)
  if (route.query.maxPrice) priceMax.value = Number(route.query.maxPrice)
  if (route.query.distanceKm) distanceKm.value = Number(route.query.distanceKm)
  
  if (route.query.latitude) {
    const lat = Number(route.query.latitude)
    latitude.value = lat
    latitudeInput.value = lat.toString()
  }
  
  if (route.query.longitude) {
    const lng = Number(route.query.longitude)
    longitude.value = lng
    longitudeInput.value = lng.toString()
  }
  
  syncToStore()
})

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

const handleLatLongChange = () => {
  latitude.value = latitudeInput.value ? parseFloat(latitudeInput.value) : null
  longitude.value = longitudeInput.value ? parseFloat(longitudeInput.value) : null
}

const syncToStore = () => {
  store.selectedCategoryIds = [...selectedCategoryIds.value]
  store.priceMin = priceMin.value
  store.priceMax = priceMax.value
  store.distanceKm = distanceKm.value
  store.latitude = latitude.value
  store.longitude = longitude.value
}

watch(() => store.selectedCategoryIds, (newVal) => {
  if (JSON.stringify(newVal) !== JSON.stringify(selectedCategoryIds.value)) {
    selectedCategoryIds.value = [...newVal]
  }
}, { deep: true })

watch(() => store.latitude, (newVal) => {
  if (newVal !== latitude.value) {
    latitude.value = newVal
    latitudeInput.value = newVal !== null ? newVal.toString() : ''
  }
})

watch(() => store.longitude, (newVal) => {
  if (newVal !== longitude.value) {
    longitude.value = newVal
    longitudeInput.value = newVal !== null ? newVal.toString() : ''
  }
})

watch(() => props.categories, () => {
  if (props.categories && props.categories.length) {
    const validIds = props.categories.map(cat => cat.id)
    selectedCategoryIds.value = selectedCategoryIds.value.filter(id => validIds.includes(id))
  }
}, { immediate: true })

const applyFilters = () => {
  handleLatLongChange()
  
  syncToStore()
  
  emit('applyFilters', {
    categoryIds: selectedCategoryIds.value,
    priceMin: priceMin.value !== '' ? priceMin.value : null,
    priceMax: priceMax.value !== '' ? priceMax.value : null,
    distanceKm: distanceKm.value !== '' ? distanceKm.value : null,
    latitude: latitude.value,
    longitude: longitude.value
  })
}
</script>

<style>
@import "../styles/components/FilterPanel.css";
</style>