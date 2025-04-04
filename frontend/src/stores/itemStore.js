import { defineStore } from 'pinia';
import axios from 'axios';
import { ref } from 'vue';

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

  const items = ref([])

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

  const searchItems = async (filters) => {
    try {
      console.log('[searchItems] Filters:', filters)
  
      const queryParams = new URLSearchParams()
      if (filters.searchQuery) queryParams.append('searchQuery', filters.searchQuery)
      if (filters.categoryId != null) queryParams.append('categoryId', filters.categoryId)
      if (filters.minPrice != null) queryParams.append('minPrice', filters.minPrice)
      if (filters.maxPrice != null) queryParams.append('maxPrice', filters.maxPrice)
      if (filters.latitude != null) queryParams.append('latitude', filters.latitude)
      if (filters.longitude != null) queryParams.append('longitude', filters.longitude)
      if (filters.distanceKm != null) queryParams.append('distanceKm', filters.distanceKm)
  
      const url = `http://localhost:8080/api/items?${queryParams.toString()}`
      const headers = getAuthHeaders()
      const res = await fetch(url, {
        method: 'GET',
        headers,
      })
  
      const rawText = await res.text()
      console.log('[searchItems] Raw response text:', rawText)
  
      if (!res.ok) {
        console.error('[searchItems] Response error:', res.status)
        items.value = []
        return
      }
  
      items.value = JSON.parse(rawText)
      console.log('[searchItems] Parsed items:', items.value)
  
    } catch (err) {
      console.error('[searchItems] Request failed:', err)
      items.value = []
    }
  }
  
  

  return {
    items,
    fetchMarketItems,
    fetchItemById,
    fetchUserItems,
    createItem,
    updateItem,
    deleteItem,
    fetchUserFavoriteItems,
    toggleFavorite,
    searchItems
  };
});