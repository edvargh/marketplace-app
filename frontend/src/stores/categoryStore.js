import { defineStore } from 'pinia';
import axios from 'axios';

export const useCategoryStore = defineStore('categories', () => {

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/categories');
      return response.data;

    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  return {
    fetchCategories
  };
});