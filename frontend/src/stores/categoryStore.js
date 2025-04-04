import { defineStore } from 'pinia';
import axios from 'axios';

export const useCategoryStore = defineStore('categories', () => {
  const getAuthHeaders = () => {
    const userData = localStorage.getItem('user');
    if (!userData) throw new Error('User not authenticated');

    const user = JSON.parse(userData);
    return {
      'Authorization': `Bearer ${user.token || localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    };
  };


  const fetchCategories = async () => {
    try {
      const headers = getAuthHeaders();  // Now required
      const response = await axios.get('http://localhost:8080/api/categories', { headers });
      return response.data;
      
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const createCategory = async (categoryData) => {
    try {
      const headers = getAuthHeaders();
      const response = await axios.post('http://localhost:8080/api/categories', categoryData, { headers });
      return response.data;

    } catch (err) {
      console.error('Error creating category:', err);
      throw err;
    }
  };

  const updateCategory = async (id, categoryData) => {
    try {
      const headers = getAuthHeaders();
      const response = await axios.put(`http://localhost:8080/api/categories/${id}`, categoryData, { headers });
      return response.data;

    } catch (err) {
      console.error(`Error updating category with ID ${id}:`, err);
      throw err;
    }
  };


  return {
    fetchCategories,
    createCategory,
    updateCategory
  };
});