import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import axios from 'axios';
import { useMessageStore } from '@/stores/messageStore';
import { messageFactory } from '@/tests/factories/messageFactory';

vi.mock('axios');

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

describe('messageStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());

    vi.stubGlobal('localStorage', {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn()
    });

    const user = messageFactory.createUser();
    localStorage.getItem.mockImplementation((key) => {
      if (key === 'user') return JSON.stringify(user);
      if (key === 'token') return user.token;
      return null;
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getAuthHeaders', () => {
    it('should return correct headers when user is authenticated', () => {
      const store = useMessageStore();
      axios.get.mockResolvedValueOnce({ data: [] });
      store.fetchUserConversations();

      expect(axios.get).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/messages/conversations`,
        {
          headers: {
            'Authorization': 'Bearer valid-auth-token',
            'Content-Type': 'application/json'
          }
        }
      );
    });

    it('should return empty array when user is not authenticated', async () => {
      localStorage.getItem.mockReturnValueOnce(null);
      const store = useMessageStore();
      
      const result = await store.fetchUserConversations();
      expect(result).toEqual([]);
    });
  }); 

  describe('fetchUserConversations', () => {
    it('should fetch user conversations successfully', async () => {
      const mockConversations = messageFactory.createConversations();
      axios.get.mockResolvedValueOnce({ data: mockConversations });

      const store = useMessageStore();
      const result = await store.fetchUserConversations();

      expect(axios.get).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/messages/conversations`,
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer valid-auth-token'
          })
        })
      );
      expect(result).toEqual(mockConversations);
    });

    it('should return empty array on error', async () => {
      axios.get.mockRejectedValueOnce(new Error('Network error'));

      const store = useMessageStore();
      const result = await store.fetchUserConversations();

      expect(result).toEqual([]); 
    });
  });

  describe('fetchConversationWithUser', () => {
    it('should fetch conversation with specific user and item', async () => {
      const mockConversation = messageFactory.createConversation();
      axios.get.mockResolvedValueOnce({ data: mockConversation });

      const store = useMessageStore();
      const result = await store.fetchConversationWithUser('item-456', '456-receiver-id');

      expect(axios.get).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/messages/conversation`,
        {
          headers: expect.objectContaining({
            'Authorization': 'Bearer valid-auth-token'
          }),
          params: { itemId: 'item-456', withUserId: '456-receiver-id' }
        }
      );
      expect(result).toEqual(mockConversation);
    });

    it('should return empty array on error', async () => {
      axios.get.mockRejectedValueOnce(new Error('Network error'));

      const store = useMessageStore();
      const result = await store.fetchConversationWithUser('item-456', '456-receiver-id');

      expect(result).toEqual([]); // Removed console.error check
    });
  });

  describe('sendMessage', () => {
    it('should send message successfully', async () => {
      axios.post.mockResolvedValueOnce({ status: 200 });

      const store = useMessageStore();
      const result = await store.sendMessage('item-456', '456-receiver-id', 'Hello there!');

      expect(axios.post).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/messages/send`,
        {
          itemId: 'item-456',
          receiverId: '456-receiver-id',
          messageText: 'Hello there!'
        },
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer valid-auth-token'
          })
        })
      );
      expect(result).toBe(true);
    });

    it('should return false on error', async () => {
      axios.post.mockRejectedValueOnce(new Error('Network error'));

      const store = useMessageStore();
      const result = await store.sendMessage('item-456', '456-receiver-id', 'Hello there!');

      expect(result).toBe(false); 
    });
  });

  describe('ensureConversationExists', () => {
    it('should return existing conversation', async () => {
      const mockConversation = messageFactory.createConversation();
      axios.get.mockResolvedValueOnce({ data: mockConversation });

      const store = useMessageStore();
      const result = await store.ensureConversationExists('item-456', '456-receiver-id');

      expect(axios.get).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/messages/conversation`,
        expect.objectContaining({
          params: { itemId: 'item-456', withUserId: '456-receiver-id' }
        })
      );
      expect(result).toEqual(mockConversation);
    });

    it('should return empty array if conversation cannot be fetched', async () => {
      axios.get.mockRejectedValueOnce(new Error('Network error'));

      const store = useMessageStore();
      const result = await store.ensureConversationExists('item-456', '456-receiver-id');

      expect(result).toEqual([]); 
    });
  });

  describe('sendReservationRequest', () => {
    it('should send reservation request successfully', async () => {
      axios.post.mockResolvedValueOnce({ status: 200 });

      const store = useMessageStore();
      const result = await store.sendReservationRequest('item-456', '456-receiver-id', 'I would like to reserve this item');

      expect(axios.post).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/messages/send-reservation-request`,
        {
          itemId: 'item-456',
          receiverId: '456-receiver-id',
          messageText: 'I would like to reserve this item',
          isReservationRequest: true,
          reservationStatus: 'PENDING'
        },
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer valid-auth-token'
          })
        })
      );
      expect(result).toBe(true);
    });

    it('should return false on error', async () => {
      axios.post.mockRejectedValueOnce(new Error('Network error'));

      const store = useMessageStore();
      const result = await store.sendReservationRequest('item-456', '456-receiver-id', 'I would like to reserve this item');

      expect(result).toBe(false); 
    });
  });

  describe('updateReservationStatus', () => {
    it('should update reservation status successfully', async () => {
      axios.put.mockResolvedValueOnce({ status: 200 });

      const store = useMessageStore();
      const result = await store.updateReservationStatus('msg-123', 'ACCEPTED');

      expect(axios.put).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/messages/msg-123/update-reservation-status?status=ACCEPTED`,
        {},
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer valid-auth-token'
          })
        })
      );
      expect(result).toBe(true);
    });

    it('should return false on error', async () => {
      axios.put.mockRejectedValueOnce(new Error('Network error'));

      const store = useMessageStore();
      const result = await store.updateReservationStatus('msg-123', 'REJECTED');

      expect(result).toBe(false); 
    });
  });
});