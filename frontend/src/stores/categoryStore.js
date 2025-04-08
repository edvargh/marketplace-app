import { defineStore } from 'pinia';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
if (!API_BASE_URL) {
  throw new Error('VITE_API_BASE_URL is not defined. Please set it in your .env file.');
}

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
      const headers = getAuthHeaders();  
      const response = await axios.get(`${API_BASE_URL}/api/categories`, { headers });
      return response.data;
      
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const createCategory = async (categoryData) => {
    try {
      const headers = getAuthHeaders();
      const response = await axios.post(`${API_BASE_URL}/api/categories`, categoryData, { headers });
      return response.data;

    } catch (err) {
      console.error('Error creating category:', err);
      throw err;
    }
  };

  const updateCategory = async (id, categoryData) => {
    try {
      const headers = getAuthHeaders();
      const response = await axios.put(`${API_BASE_URL}/api/categories/${id}`, categoryData, { headers });
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