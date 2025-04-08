    import { defineStore } from 'pinia'
    import axios from 'axios'

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    if (!API_BASE_URL) {
    throw new Error('VITE_API_BASE_URL is not defined. Please set it in your .env file.');
    }

    export const useMessageStore = defineStore('messageStore', () => {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
          const response = await axios.get(`${API_BASE_URL}/conversations`, { headers })
          return response.data
        } catch (err) {
          console.error('Error fetching user conversations:', err)
          return []
        }
      }

      const fetchConversationWithUser = async (itemId, withUserId) => {
        try {
          const headers = getAuthHeaders()
          const response = await axios.get(`${API_BASE_URL}/conversation`, {
            headers,
            params: { itemId, withUserId }
          })
          return response.data
        } catch (err) {
          console.error('Error fetching conversation:', err)
          return []
        }
      }

      const sendMessage = async (itemId, receiverId, messageText) => {
        try {
          const headers = getAuthHeaders()
          const payload = { itemId, receiverId, messageText }
          const response = await axios.post(`${API_BASE_URL}/send`, payload, { headers })
          return response.status === 200
        } catch (err) {
          console.error('Error sending message:', err)
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
          const response = await axios.post(`${API_BASE_URL}/send-reservation-request`, payload, { headers })
          return response.status === 200
        } catch (err) {
          console.error('Error sending reservation request:', err)
          return false
        }
      }

      const updateReservationStatus = async (messageId, status) => {
        try {
          const headers = getAuthHeaders()

          const response = await axios.put(
            `${API_BASE_URL}/${messageId}/update-reservation-status?status=${status}`,
            {},
            { headers }
          )
          return response.status === 200

        } catch (err) {
          console.error('Error updating reservation status:', err)
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
