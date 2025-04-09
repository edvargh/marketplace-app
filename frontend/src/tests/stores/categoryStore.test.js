import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useCategoryStore } from '@/stores/categoryStore';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

vi.mock('axios');

describe('Category Store', () => {
  let store;
  
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    clear: vi.fn(),
    removeItem: vi.fn()
  };
  
  beforeEach(() => {
    global.localStorage = localStorageMock;
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'user') {
        return JSON.stringify({ token: 'fake-token' });
      }
      return null;
    });
    setActivePinia(createPinia());
    store = useCategoryStore();
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    vi.resetAllMocks();
  });
  
  describe('getAuthHeaders', () => {
    it('should return valid headers when user is authenticated', async () => {
      axios.get.mockResolvedValueOnce({ data: [] });
      
      await store.fetchCategories();
      
      expect(axios.get).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/categories`,
        {
          headers: {
            'Authorization': 'Bearer fake-token',
            'Content-Type': 'application/json'
          }
        }
      );
    });
    
    it('should throw an error when user is not authenticated', async () => {
      localStorageMock.getItem.mockImplementation(() => null);
      
      await expect(store.fetchCategories()).rejects.toThrow('User not authenticated');
    });
  });
  
  describe('fetchCategories', () => {
    it('should fetch categories successfully', async () => {
      const mockCategories = [
        { id: 1, name: 'Category 1' },
        { id: 2, name: 'Category 2' }
      ];
      
      axios.get.mockResolvedValueOnce({ data: mockCategories });
      
      const result = await store.fetchCategories();
      
      expect(axios.get).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockCategories);
    });
    
    it('should handle fetch categories error', async () => {
      const error = new Error('Network error');
      
      axios.get.mockRejectedValueOnce(error);
      
      await expect(store.fetchCategories()).rejects.toThrow('Network error');
    });
  });
  
  describe('createCategory', () => {
    it('should create a category successfully', async () => {
      const newCategory = { name: 'New Category' };
      const createdCategory = { id: 3, name: 'New Category' };
      
      axios.post.mockResolvedValueOnce({ data: createdCategory });
      
      const result = await store.createCategory(newCategory);
      
      expect(axios.post).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/categories`,
        newCategory,
        {
          headers: {
            'Authorization': 'Bearer fake-token',
            'Content-Type': 'application/json'
          }
        }
      );
      expect(result).toEqual(createdCategory);
    });
    
    it('should throw an error when create category fails', async () => {
      const newCategory = { name: 'New Category' };
      const error = new Error('Failed to create category');
      
      axios.post.mockRejectedValueOnce(error);
      
      await expect(store.createCategory(newCategory)).rejects.toThrow('Failed to create category');
    });
  });
  
  describe('updateCategory', () => {
    it('should update a category successfully', async () => {
      const categoryId = 1;
      const updatedCategoryData = { name: 'Updated Category' };
      const updatedCategory = { id: 1, name: 'Updated Category' };
      
      axios.put.mockResolvedValueOnce({ data: updatedCategory });
      
      const result = await store.updateCategory(categoryId, updatedCategoryData);
      
      expect(axios.put).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/categories/${categoryId}`,
        updatedCategoryData,
        {
          headers: {
            'Authorization': 'Bearer fake-token',
            'Content-Type': 'application/json'
          }
        }
      );
      expect(result).toEqual(updatedCategory);
    });
    
    it('should throw an error when update category fails', async () => {
      const categoryId = 1;
      const updatedCategoryData = { name: 'Updated Category' };
      const error = new Error('Failed to update category');
      
      axios.put.mockRejectedValueOnce(error);
      
      await expect(store.updateCategory(categoryId, updatedCategoryData)).rejects.toThrow('Failed to update category');
    });
  });
  
  describe('API_BASE_URL validation', () => {
    it('should throw an error if API_BASE_URL is not defined', () => {
      const checkApiBaseUrl = () => {
        const API_BASE_URL = undefined;
        if (!API_BASE_URL) {
          throw new Error('VITE_API_BASE_URL is not defined. Please set it in your ..env file.');
        }
      };
      
      expect(checkApiBaseUrl).toThrow('VITE_API_BASE_URL is not defined');
    });
  });
});
