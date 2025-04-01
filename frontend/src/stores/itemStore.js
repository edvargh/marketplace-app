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

  const fetchItemById = async (id) => {
    try {
      const headers = getAuthHeaders();
      const response = await axios.get(`http://localhost:8080/api/items/${id}`, { headers });
      return response.data;
    } catch (err) {
      console.error(`Error fetching item with ID ${id}:`, err);
      throw err;
    }
  };

  const fetchUserItems = async () => {
    try {
      const headers = getAuthHeaders();
      const response = await axios.get(`http://localhost:8080/api/items/my-items`, { headers });
      return response.data;
    } catch (err) {
      console.error(`Error fetching items:`, err);
      throw err;
    }
  }

  const createItem = async (rawFormData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const formDataToSend = new FormData();
      const itemData = {
        title: rawFormData.title,
        description: rawFormData.description,
        categoryId: rawFormData.categoryId,
        price: parseFloat(rawFormData.price),
        city: rawFormData.city,
        status: rawFormData.status || 'For Sale', // Default status
        latitude: 63.43,
        longitude: 10.3925
      };

      // JSON blob
      formDataToSend.append(
          'item',
          new Blob([JSON.stringify(itemData)], { type: 'application/json' })
      );

      // Append images
      if (Array.isArray(rawFormData.images)) {
        rawFormData.images.forEach(image => {
          if (image?.file) {
            formDataToSend.append('images', image.file);
          }
        });
      }

      const response = await fetch('http://localhost:8080/api/items/create', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formDataToSend
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.message || 'Failed to create item');
      }
      return await response.json();

    } catch (error) {
      console.error('Failed to create item:', error);
      throw error;
    }
  };


  return {
    fetchAllItems,
    fetchItemById,
    fetchUserItems,
    createItem,
  };
});