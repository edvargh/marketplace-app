<template>
    <div class = "FilterPanel">
        <div>
            <h3 class="filter-headers">Categories</h3>
        <CheckboxGroup :options="categoryOptions" v-model="selectedCategories" />
        </div>
    
    <div>
        <h3 class ="filter-headers">Locations</h3>
        <CheckboxGroup :options="locationOptions" v-model="selectedLocations" />
    </div>
        
    <div class="price-range">
        <h3 class ="filter-headers">Price Range</h3>
        <div class="price-inputs">
            <div class="price-input">
                <label>Min Price (kr)</label>
                <input 
                    type="number" 
                    v-model.number="priceMin" 
                    min="0" 
                    placeholder="0"
                    @input="validatePriceInput"
                >
            </div>
            
            <div class="price-input">
                <label>Max Price (kr)</label>
                <input 
                    type="number" 
                    v-model.number="priceMax" 
                    min="0" 
                    placeholder="10000000"
                    @input="validatePriceInput"
                >
            </div>
        </div>
    <p v-if="priceError" class="price-error">{{ priceError }}</p>
    </div>
        <CustomButton 
            @click="applyFilters" 
            class="apply-filters-button"
            :disabled="!!priceError"
        >
            Apply Filters
        </CustomButton>
    </div>
</template>


<script setup>
import { ref } from 'vue'
import CheckboxGroup from '@/components/CheckBoxGroup.vue'
import CustomButton from '@/components/CustomButton.vue'
import { computed } from 'vue'

const emit = defineEmits(['applyFilters'])

const selectedCategories = ref([])
const selectedLocations = ref([])
const priceMin = ref('')
const priceMax = ref('')
const MAX_PRICE = 10_000_000

const categoryOptions = ['Kitchen', 'Computers', 'Clothes']
const locationOptions = ['Oslo', 'Bergen', 'Lillestrøm', 'Trondheim', 'Stavanger', 'Lillehammer']

const applyFilters = () => {
  emit('applyFilters', {
    categories: selectedCategories.value,
    locations: selectedLocations.value,
    priceMin: priceMin.value,
    priceMax: priceMax.value,
  })
}

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
</script>

<style>
@import '../styles/components/FilterPanel.css';
</style>