import { defineStore } from 'pinia';
import axios from 'axios';
import { ref } from 'vue';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
if (!API_BASE_URL) {
throw new Error('VITE_API_BASE_URL is not defined. Please set it in your ..env file.');
}

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

  const fetchMarketItems = async (page = 0, size = 6) => {
    try {
      const headers = getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/api/items`, {
        headers,
        params: { page, size }
      });
      return response.data;
    } catch (err) {
      return [];
    }
  };

  const fetchItemById = async (id) => {
    try {
      const headers = getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/api/items/${id}`, { headers });
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const fetchUserItems = async (page = 0, size = 6) => {
    try {
      const headers = getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/api/items/my-items`, {
        headers,
        params: { page, size }
      });
      return response.data;
    } catch (err) {
      throw err;
    }
  }

  const fetchRecommendedItems = async () => {
    try {
      const headers = getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/api/items/recommended`, { headers });
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
        `${API_BASE_URL}/api/items/${itemId}/view`, 
        {}, 
        { headers }
      );
      return response.status === 200;
    } catch (err) {
      return false;
    }
  };

  const fetchUserFavoriteItems = async (page = 0, size = 6) => {
    try {
      const headers = getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/api/items/favorites`, {
        headers,
        params: { page, size }
      });
      return response.data;
    } catch (err) {
      throw err;
    }
  }

  const toggleFavorite = async (itemId) => {
    try {
      const headers = getAuthHeaders();
      const response = await axios.put(`${API_BASE_URL}/api/items/${itemId}/favorite-toggle`, {}, { headers });
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

      const response = await fetch('${API_BASE_URL}/api/items/create', {
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

      const response = await fetch(`${API_BASE_URL}/api/items/${id}`, {
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
      const response = await axios.delete(`${API_BASE_URL}/api/items/${id}`, { headers });
      return response.status === 204;

    } catch (err) {
      throw err;
    }
  };

  const searchItems = async (filters, page = 0, size = 6) => {
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

      queryParams.append('page', page);
      queryParams.append('size', size);

      const url = `${API_BASE_URL}/api/items?${queryParams.toString()}`;
      const headers = getAuthHeaders();
      
      const response = await axios.get(url, { headers });
      
      return response.data;
      
    } catch (err) {
      items.value = [];
      throw err;
    }
  }

  const updateItemStatus = async (id, newStatus, buyerId = null) => {
    try {
      const headers = getAuthHeaders();
      const params = { value: newStatus };
      if (buyerId) {
        params.buyerId = buyerId;
      }

      const response = await axios.put(`${API_BASE_URL}/api/items/${id}/status`,
        null,
        {
          headers,
          params
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
        `${API_BASE_URL}/api/payments/vipps?itemId=${itemId}`,
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