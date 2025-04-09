import { setActivePinia, createPinia } from 'pinia';
import { useItemStore } from '@/stores/itemStore';
import axios from 'axios';
import { itemFactory } from '@/tests/factories/itemFactory';
import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

vi.mock('axios');

describe('itemStore', () => {
  let store;
  
  beforeEach(() => {
    const pinia = createPinia();
    setActivePinia(pinia);
    
    store = useItemStore();
    
    vi.spyOn(Storage.prototype, 'setItem');
    vi.spyOn(Storage.prototype, 'getItem');
    vi.spyOn(Storage.prototype, 'removeItem');
    
    localStorage.clear();
    localStorage.setItem('user', JSON.stringify({ token: 'dummy_token' }));
    localStorage.setItem('token', 'dummy_token');
    
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  test('should fetch market items', async () => {
    const items = [itemFactory(), itemFactory()];
    const pageData = {
      content: items,
      pageable: {
        pageNumber: 0,
        pageSize: 6,
        totalElements: 10,
        totalPages: 2
      }
    };
    
    axios.get.mockResolvedValueOnce({ data: pageData });

    const response = await store.fetchMarketItems(0, 6);

    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(
      `${API_BASE_URL}/api/items`,
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer dummy_token',
          'Content-Type': 'application/json'
        }),
        params: { page: 0, size: 6 }
      })
    );
    expect(response).toEqual(pageData);
  });

  test('should fetch item by ID', async () => {
    const item = itemFactory();
    
    axios.get.mockResolvedValueOnce({ data: item });

    const response = await store.fetchItemById(item.id);

    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(
      `${API_BASE_URL}/api/items/${item.id}`,
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer dummy_token',
          'Content-Type': 'application/json'
        })
      })
    );
    expect(response).toEqual(item);
  });

  test('should fetch user items', async () => {
    const items = [itemFactory(), itemFactory()];
    const pageData = {
      content: items,
      pageable: {
        pageNumber: 0,
        pageSize: 6,
        totalElements: 10,
        totalPages: 2
      }
    };
    
    axios.get.mockResolvedValueOnce({ data: pageData });

    const response = await store.fetchUserItems(0, 6);

    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(
      `${API_BASE_URL}/api/items/my-items`,
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer dummy_token',
          'Content-Type': 'application/json'
        }),
        params: { page: 0, size: 6 }
      })
    );
    expect(response).toEqual(pageData);
  });

  test('should fetch recommended items', async () => {
    const items = [itemFactory(), itemFactory()];
    
    axios.get.mockResolvedValueOnce({ data: items });

    const response = await store.fetchRecommendedItems();

    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(
      `${API_BASE_URL}/api/items/recommended`,
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer dummy_token',
          'Content-Type': 'application/json'
        })
      })
    );
    expect(response).toEqual(items);
  });

  test('should log item view', async () => {
    const item = itemFactory();
    
    axios.post.mockResolvedValueOnce({ status: 200 });

    const response = await store.logItemView(item.id);

    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.post).toHaveBeenCalledWith(
      `${API_BASE_URL}/api/items/${item.id}/view`,
      {},
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer dummy_token',
          'Content-Type': 'application/json'
        })
      })
    );
    expect(response).toBe(true);
  });

  test('should fetch user favorite items', async () => {
    const items = [itemFactory(), itemFactory()];
    const pageData = {
      content: items,
      pageable: {
        pageNumber: 0,
        pageSize: 6,
        totalElements: 10,
        totalPages: 2
      }
    };
    
    axios.get.mockResolvedValueOnce({ data: pageData });

    const response = await store.fetchUserFavoriteItems();

    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(
      `${API_BASE_URL}/api/items/favorites`,
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer dummy_token',
          'Content-Type': 'application/json'
        }),
        params: { page: 0, size: 6 }
      })
    );
    expect(response).toEqual(pageData);
  });

  test('should toggle favorite status', async () => {
    const item = itemFactory();
    
    axios.put.mockResolvedValueOnce({ status: 200 });

    const response = await store.toggleFavorite(item.id);

    expect(axios.put).toHaveBeenCalledTimes(1);
    expect(axios.put).toHaveBeenCalledWith(
      `${API_BASE_URL}/api/items/${item.id}/favorite-toggle`,
      {},
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer dummy_token',
          'Content-Type': 'application/json'
        })
      })
    );
    expect(response).toBe(true);
  });

  test('should create a new item', async () => {
    const newItem = itemFactory();
    const formData = {
      title: newItem.title,
      description: newItem.description,
      categoryId: newItem.categoryId,
      price: newItem.price.toString(),
      latitude: newItem.latitude,
      longitude: newItem.longitude,
      images: [{ file: new File(['test'], 'test.jpg', { type: 'image/jpeg' }) }]
    };
    
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => newItem,
    });

    const response = await store.createItem(formData);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(`${API_BASE_URL}/api/items/create`),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Authorization': 'Bearer dummy_token'
        }),
        body: expect.any(FormData)
      })
    );
    expect(response).toEqual(newItem);
  });

  test('should update an existing item', async () => {
    const item = itemFactory();
    const updatedItem = { ...item, title: 'Updated Title' };
    const formData = {
      title: updatedItem.title,
      description: updatedItem.description,
      categoryId: updatedItem.categoryId,
      price: updatedItem.price.toString(),
      status: updatedItem.status,
      latitude: updatedItem.latitude,
      longitude: updatedItem.longitude,
      images: [{ file: new File(['test'], 'test.jpg', { type: 'image/jpeg' }) }]
    };
    
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => updatedItem,
    });

    const response = await store.updateItem(item.id, formData);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(`${API_BASE_URL}/api/items/${item.id}`),
      expect.objectContaining({
        method: 'PUT',
        headers: expect.objectContaining({
          'Authorization': 'Bearer dummy_token'
        }),
        body: expect.any(FormData)
      })
    );
    expect(response).toEqual(updatedItem);
  });

  test('should delete an item', async () => {
    const item = itemFactory();
    
    axios.delete.mockResolvedValueOnce({ status: 204 });

    const response = await store.deleteItem(item.id);

    expect(axios.delete).toHaveBeenCalledTimes(1);
    expect(axios.delete).toHaveBeenCalledWith(
      `${API_BASE_URL}/api/items/${item.id}`,
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer dummy_token',
          'Content-Type': 'application/json'
        })
      })
    );
    expect(response).toBe(true);
  });

  test('should search items with filters', async () => {
    const items = [itemFactory(), itemFactory()];
    const pageData = {
      content: items,
      pageable: {
        pageNumber: 0,
        pageSize: 6,
        totalElements: 10,
        totalPages: 2
      }
    };
    
    axios.get.mockResolvedValueOnce({ data: pageData });

    const filters = {
      searchQuery: 'test',
      categoryIds: ['cat-1', 'cat-2'],
      minPrice: 10,
      maxPrice: 100,
      latitude: 60.123,
      longitude: 10.456,
      distanceKm: 5
    };

    const response = await store.searchItems(filters);

    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer dummy_token',
          'Content-Type': 'application/json'
        })
      })
    );
    expect(response).toEqual(pageData);
  });

  test('should update item status', async () => {
    const item = itemFactory();
    const newStatus = 'Sold';
    
    axios.put.mockResolvedValueOnce({ status: 200 });

    const response = await store.updateItemStatus(item.id, newStatus);

    expect(axios.put).toHaveBeenCalledTimes(1);
    expect(axios.put).toHaveBeenCalledWith(
      `${API_BASE_URL}/api/items/${item.id}/status`,
      null,
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer dummy_token',
          'Content-Type': 'application/json'
        }),
        params: { value: newStatus }
      })
    );
    expect(response).toBe(true);
  });

  test('should initiate Vipps payment', async () => {
    const item = itemFactory();
    const redirectUrl = 'https://vipps.payment.url';
    
    axios.post.mockResolvedValueOnce({ data: redirectUrl });

    const response = await store.initiateVippsPayment(item.id);

    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.post).toHaveBeenCalledWith(
      `${API_BASE_URL}/api/payments/vipps?itemId=${item.id}`,
      {},
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer dummy_token',
          'Content-Type': 'application/json'
        })
      })
    );
    expect(response).toEqual(redirectUrl);
  });

  test('should handle error when user is not authenticated', async () => {
    localStorage.clear();
    
    await expect(store.fetchMarketItems()).resolves.toEqual([]);
  });

  test('should handle API errors appropriately', async () => {
    const item = itemFactory();
    
    const error = new Error('API Error');
    axios.get.mockRejectedValueOnce(error);

    await expect(store.fetchItemById(item.id)).rejects.toThrow();
  });
});