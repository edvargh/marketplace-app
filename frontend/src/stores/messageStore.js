    import { defineStore } from 'pinia'
    import axios from 'axios'

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    if (!API_BASE_URL) {
    throw new Error('VITE_API_BASE_URL is not defined. Please set it in your ..env file.');
    }

    export const useMessageStore = defineStore('messageStore', () => {
      const getAuthHeaders = () => {
        const userData = localStorage.getItem('user')
        if (!userData) throw new Error('User not authenticated')

        const user = JSON.parse(userData)
        return {
          'Authorization': `Bearer ${user.token || localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      }

      const fetchUserConversations = async () => {
        try {
          const headers = getAuthHeaders()
          const response = await axios.get(`${API_BASE_URL}/api/messages/conversations`, { headers })
          return response.data
        } catch (err) {
          return []
        }
      }

      const fetchConversationWithUser = async (itemId, withUserId) => {
        try {
          const headers = getAuthHeaders()
          const response = await axios.get(`${API_BASE_URL}/api/messages/conversation`, {
            headers,
            params: { itemId, withUserId }
          })
          return response.data
        } catch (err) {
          return []
        }
      }

      const sendMessage = async (itemId, receiverId, messageText) => {
        try {
          const headers = getAuthHeaders()
          const payload = { itemId, receiverId, messageText }
          const response = await axios.post(`${API_BASE_URL}/api/messages/send`, payload, { headers })
          return response.status === 200
        } catch (err) {
          return false
        }
      }

      const ensureConversationExists = async (itemId, withUserId) => {
        try {
          return await fetchConversationWithUser(itemId, withUserId)
        } catch (err) {
          return []
        }
      }

      const sendReservationRequest = async (itemId, receiverId, messageText) => {
        try {
          const headers = getAuthHeaders()
          const payload = {
            itemId,
            receiverId,
            messageText,
            isReservationRequest: true,
            reservationStatus: "PENDING"
          }
          const response = await axios.post(`${API_BASE_URL}/api/messages/send-reservation-request`, payload, { headers })
          return response.status === 200
        } catch (err) {
          return false
        }
      }

      const updateReservationStatus = async (messageId, status) => {
        try {
          const headers = getAuthHeaders()

          const response = await axios.put(
            `${API_BASE_URL}/api/messages/${messageId}/update-reservation-status?status=${status}`,
            {},
            { headers }
          )
          return response.status === 200

        } catch (err) {
          return false
        }
      }

      return {
        fetchUserConversations,
        fetchConversationWithUser,
        sendMessage,
        ensureConversationExists,
        sendReservationRequest,
        updateReservationStatus
      }
    })
