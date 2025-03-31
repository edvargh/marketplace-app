// src/stores/categoryStore.js
import { ref } from 'vue';
import axios from 'axios';

const categoriesDb = ref([]);
const categories = ref([]);

const fetchCategories = async () => {
    try {
        const response = await axios.get('http://localhost:8080/api/categories');
        categoriesDb.value = response.data;
        categories.value = response.data.map(category => category.name);
    } catch (error) {
        console.error('Error fetching categories:', error);
    }
};

export default {
    categoriesDb,
    categories,
    fetchCategories
};
