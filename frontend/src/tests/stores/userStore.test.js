import { setActivePinia, createPinia } from 'pinia';
import { useUserStore } from '@/stores/userStore';
import { userFactory } from '@/tests/factories/userFactory'; 
import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { use } from 'chai';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

describe('userStore', () => {
  let store;
  
  beforeEach(() => {
    const pinia = createPinia();
    setActivePinia(pinia);
    
    store = useUserStore();
    
    vi.spyOn(Storage.prototype, 'setItem');
    vi.spyOn(Storage.prototype, 'getItem');
    
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  test('should register a new user', async () => {
    const newUser = userFactory();
    const mockResponse = {
      token: 'dummy_token',
      user: newUser,
    };
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const response = await store.register(
      newUser.fullName,
      newUser.email,
      'password123',
      newUser.phoneNumber
    );

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(`${API_BASE_URL}/api/auth/register`),
      expect.objectContaining({
        method: 'POST',
        headers: expect.any(Object),
        body: expect.any(String),
      })
    );
    expect(response.user).toEqual(newUser);    
  });

  test('should handle check authentication', async() => {
    const existingUser = userFactory();
    const token = 'dummy_token';

    localStorage.getItem.mockReturnValueOnce(token);

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => existingUser,
    });

    await store.checkAuth();

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(`${API_BASE_URL}/api/users/me`),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }),
      })
    );

    expect(store.isAuthenticated).toBe(true);
    expect(store.user).toEqual(existingUser);
  });

  test('should login an existing user', async () => {
    const existingUser = userFactory();
    const mockResponse = {
      token: 'dummy_token',
      user: existingUser,
    };
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const response = await store.login(existingUser.email, 'password123');

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(`${API_BASE_URL}/api/auth/login`),
      expect.objectContaining({
        method: 'POST',
        headers: expect.any(Object),
        body: expect.any(String),
      })
    );
    expect(response).toEqual(existingUser);
    expect(store.isAuthenticated).toBe(true);
    expect(localStorage.setItem).toHaveBeenCalledWith('token', 'dummy_token');
    expect(localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(existingUser));
  });

  test('should update user profile', async () => {
    const existingUser = userFactory();
    store.user = existingUser;
    store.isAuthenticated = true;
    
    const updatedFields = { fullName: 'Updated User' };
    const updatedUser = { ...existingUser, ...updatedFields };
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => updatedUser,
    });

    localStorage.getItem.mockReturnValueOnce('dummy_token');

    const response = await store.updateUser({
      fullName: 'Updated User',
      email: existingUser.email,
      phoneNumber: existingUser.phoneNumber,
      preferredLanguage: existingUser.preferredLanguage,
      profilePicture: null,
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(`${API_BASE_URL}/api/users/${existingUser.id}`),
      expect.objectContaining({
        method: 'PUT',
        headers: expect.objectContaining({
          'Authorization': 'Bearer dummy_token'
        }),
      })
    );
    expect(response.fullName).toBe('Updated User');
    expect(store.user.fullName).toBe('Updated User');
  });

  test('should fetch user profile when authenticated', async () => {
    const existingUser = userFactory();
    localStorage.getItem.mockReturnValueOnce('dummy_token'); 
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => existingUser,
    });

    const response = await store.checkAuth();

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(`${API_BASE_URL}/api/users/me`),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer dummy_token',
          'Content-Type': 'application/json'
        }),
      })
    );
    expect(response).toEqual(existingUser);
    expect(store.isAuthenticated).toBe(true);
  });

  test('should handle failed login', async () => {
    const user = userFactory();
    const errorMessage = 'Invalid credentials';
    
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: errorMessage }),
    });

    await expect(
      store.login(user.email, 'wrongpassword')
    ).rejects.toEqual(
      expect.objectContaining({ message: errorMessage })
    );
    
    expect(store.isAuthenticated).toBe(false);
  });

  test('should handle logout'), async () => {
    const existingUser = userFactory();
    
    localStorage.setItem('token', 'dummy_token');
    localStorage.setItem('user', JSON.stringify(existingUser));

    store.user = existingUser;
    store.isAuthenticated = true;

    store.logout();

    expect(localStorage.removeItem).toHaveBeenCalledWith('token');
    expect(localStorage.removeItem).toHaveBeenCalledWith('user');

    expect(store.user).toBe(null);
    expect(store.isAuthenticated).toBe(false);
    }

	test('should get user by ID'), async () => {
    const existingUser = userFactory();
    const userId = existingUser.id;
    const mockResponse = existingUser;

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    localStorage.getItem.mockReturnValueOnce('dummy_token');

    const respone = await store.getUserById(userId);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(`${API_BASE_URL}/api/users/${userId}`),
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Authorization': 'Bearer dummy_token',
          'Content-Type': 'application/json'
        }),
      })
    );

    expect(respone).toEqual(existingUser);
    expect(store.user).toEqual(existingUser);
    }
});