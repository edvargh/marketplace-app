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
    </div>

    <CustomButton @click="applyFilters" class="apply-filters-button">
        Apply Filters
    </CustomButton>
    </div>
    
</template>


<script setup>
import { ref } from 'vue'
import CheckboxGroup from '@/components/CheckBoxGroup.vue'
import CustomButton from '@/components/CustomButton.vue'

const emit = defineEmits(['applyFilters'])

const selectedCategories = ref([])
const selectedLocations = ref([])
const priceMin = ref('')
const priceMax = ref('')

const categoryOptions = ['Kitchen', 'Computers', 'Clothes']
const locationOptions = ['Oslo', 'Bergen', 'Lillestrøm', 'Trondheim', 'Stavanger', 'Lillehammer']

const emitFilters = () => {
  emit('applyFilters', {
    categories: selectedCategories.value,
    locations: selectedLocations.value,
    priceMin: priceMin.value,
    priceMax: priceMax.value,
  })
}
</script>

<style>
@import '../styles/components/FilterPanel.css';
</style>