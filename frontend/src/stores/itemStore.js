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

  const fetchMarketItems = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log("Token:", token); 

      const headers = getAuthHeaders();
      const response = await axios.get('http://localhost:8080/api/items', { headers });
      console.log("API response:", response);

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

  const fetchUserFavoriteItems = async () => {
    try {
      const headers = getAuthHeaders();
      const response = await axios.get(`http://localhost:8080/api/items/favorites`, { headers });
      return response.data;
    } catch (err) {
      console.error(`Error fetching favorite items:`, err);
      throw err;
    }
  }

  const toggleFavorite = async (itemId) => {
    try {
      const headers = getAuthHeaders();
      const response = await axios.put(`http://localhost:8080/api/items/${itemId}/favorite-toggle`, {}, { headers });
      return response.status === 200;
    } catch (err) {
      console.error(`Error toggling favorite status for item ${itemId}:`, err);
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
        status: 'For Sale',
        latitude: rawFormData.latitude,
        longitude: rawFormData.longitude,
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

  const updateItem = async (id, rawFormData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const formDataToSend = new FormData();
      const itemData = {
        title: rawFormData.title,
        description: rawFormData.description,
        categoryId: rawFormData.categoryId,
        price: parseFloat(rawFormData.price),
        status: rawFormData.status,
        latitude: rawFormData.latitude,
        longitude: rawFormData.longitude,
      };

      formDataToSend.append(
          'dto',
          new Blob([JSON.stringify(itemData)], { type: 'application/json' })
      );

      // TODO: Better handling maybe
      if (Array.isArray(rawFormData.images)) {
        rawFormData.images.forEach(img => {
          if (img?.file) {
            formDataToSend.append('images', img.file);
          }
        });
      }

      const response = await fetch(`http://localhost:8080/api/items/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formDataToSend
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.message || 'Failed to update item');
      }
      return await response.json();

    } catch (error) {
      console.error(`Failed to update item ${id}:`, error);
      throw error;
    }
  };

  const deleteItem = async (id) => {
    try {
      const headers = getAuthHeaders();
      const response = await axios.delete(`http://localhost:8080/api/items/${id}`, { headers });
      return response.status === 204;

    } catch (err) {
      console.error(`Failed to delete item ${id}:`, err);
      throw err;
    }
  };


  return {
    fetchMarketItems,
    fetchItemById,
    fetchUserItems,
    createItem,
    updateItem,
    deleteItem,
    fetchUserFavoriteItems,
    toggleFavorite
  };
});