import { defineStore } from 'pinia';
import axios from 'axios';

export const useItemStore = defineStore('items', () => {

  const getAuthHeaders = () => {
    const userData = localStorage.getItem('user');
    if (!userData) throw new Error('User not authenticated');

    const user = JSON.parse(userData);
    return {
      'Authorization': `Bearer ${user.token || localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchAllItems = async () => {
    try {
      const headers = getAuthHeaders();
      const response = await axios.get('http://localhost:8080/api/items/all-items', { headers });
      return response.data;

    } catch (err) {
      console.error('Error fetching all items:', err);
      return [];
    }
  };


  const createItem = async (formData) => {
    try {
      const payload = {
        title: formData.title,
        price: formData.price,
        city: formData.city,
        category: formData.category,
        description: formData.description,
        status: formData.status || 'available',
        // images: imageUrls,
      };

      const headers = getAuthHeaders();
      const response = await axios.post('http://localhost:8080/api/items', payload, { headers });
      return response.data;

    } catch (err) {
      console.error('Error creating item:', err);
    }
  };

  return {
    fetchAllItems,
    createItem,
  };
});