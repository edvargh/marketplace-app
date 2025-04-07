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
      const headers = getAuthHeaders();
      const response = await axios.get('http://localhost:8080/api/items', { headers });
      return response.data;
    } catch (err) {
      return [];
    }
  };

  const fetchItemById = async (id) => {
    try {
      const headers = getAuthHeaders();
      const response = await axios.get(`http://localhost:8080/api/items/${id}`, { headers });
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const fetchUserItems = async () => {
    try {
      const headers = getAuthHeaders();
      const response = await axios.get(`http://localhost:8080/api/items/my-items`, { headers });
      return response.data;
    } catch (err) {
      throw err;
    }
  }

  const fetchRecommendedItems = async () => {
    try {
      const headers = getAuthHeaders();
      const response = await axios.get(`http://localhost:8080/api/items/recommended`, { headers });
      console.log(response)
      return response.data;

    } catch (err) {
      console.error('Failed to fetch recommended items:', err);
      return [];
    }
  }

  const logItemView = async (itemId) => {
    try {
      const headers = getAuthHeaders();
      const response = await axios.post(
        `http://localhost:8080/api/items/${itemId}/view`, 
        {}, 
        { headers }
      );
      return response.status === 200;
    } catch (err) {
      return false;
    }
  };

  const fetchUserFavoriteItems = async () => {
    try {
      const headers = getAuthHeaders();
      const response = await axios.get(`http://localhost:8080/api/items/favorites`, { headers });
      return response.data;
    } catch (err) {
      throw err;
    }
  }

  const toggleFavorite = async (itemId) => {
    try {
      const headers = getAuthHeaders();
      const response = await axios.put(`http://localhost:8080/api/items/${itemId}/favorite-toggle`, {}, { headers });
      return response.status === 200;
    } catch (err) {
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
      throw error;
    }
  };

  const deleteItem = async (id) => {
    try {
      const headers = getAuthHeaders();
      const response = await axios.delete(`http://localhost:8080/api/items/${id}`, { headers });
      return response.status === 204;

    } catch (err) {
      throw err;
    }
  };

  const searchItems = async (filters) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.searchQuery) queryParams.append('searchQuery', filters.searchQuery);
      
      if (filters.categoryIds && Array.isArray(filters.categoryIds)) {
        filters.categoryIds.forEach(id => {
          queryParams.append('categoryIds', id);
        });
      }
      
      if (filters.minPrice != null && filters.minPrice !== '') queryParams.append('minPrice', filters.minPrice);
      if (filters.maxPrice != null && filters.maxPrice !== '') queryParams.append('maxPrice', filters.maxPrice);
      if (filters.latitude != null) queryParams.append('latitude', filters.latitude);
      if (filters.longitude != null) queryParams.append('longitude', filters.longitude);
      if (filters.distanceKm != null && filters.distanceKm !== '') queryParams.append('distanceKm', filters.distanceKm);
      
      const url = `http://localhost:8080/api/items?${queryParams.toString()}`;
      const headers = getAuthHeaders();
      
      const response = await axios.get(url, { headers });
      
      items.value = response.data;
      return response.data;
      
    } catch (err) {
      items.value = [];
      throw err;
    }
  }

  const updateItemStatus = async (id, newStatus) => {
    try {
      const headers = getAuthHeaders();
      const response = await axios.put(`http://localhost:8080/api/items/${id}/status`,
        null,
        {
          headers,
          params: { value: newStatus }
        }
      );
      return response.status === 200;

    } catch (err) {
      console.error(`Failed to update status for item ${id}:`, err);
      throw err;
    }
  };

  const initiateVippsPayment = async (itemId) => {
    try {
      const headers = getAuthHeaders();
      const response = await axios.post(
        `http://localhost:8080/api/payments/vipps?itemId=${itemId}`,
        {},
        { headers }
      );
      return response.data; // This should be the redirect URL
    } catch (err) {
      console.error('Failed to initiate Vipps payment:', err);
      throw err;
    }
  };

  return {
    items,
    fetchMarketItems,
    fetchItemById,
    fetchUserItems,
    fetchRecommendedItems,
    logItemView,
    createItem,
    updateItem,
    deleteItem,
    fetchUserFavoriteItems,
    toggleFavorite,
    searchItems,
    updateItemStatus,
    initiateVippsPayment
  };
});