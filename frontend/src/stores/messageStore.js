import { defineStore } from 'pinia'
import axios from 'axios'

export const useMessageStore = defineStore('messageStore', () => {
  // Auth helper
  const getAuthHeaders = () => {
    try {
      const userData = localStorage.getItem('user')
      if (!userData) throw new Error('User data not found in localStorage')

      const user = JSON.parse(userData)
      const token = user.token || localStorage.getItem('token')

      if (!token) {
        console.error('[messageStore] No auth token found in either user object or localStorage')
        throw new Error('User not authenticated')
      }

      console.log('[messageStore] Using token:', token)

      return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    } catch (error) {
      console.error('[messageStore] Auth header error:', error)
      throw error
    }
  }

  // Axios instance
  const apiClient = axios.create({
    baseURL: 'http://localhost:8080/api/messages',
  })

  // Request interceptor
  apiClient.interceptors.request.use(config => {
    try {
      const headers = getAuthHeaders()
      config.headers = {
        ...config.headers,
        ...headers
      }
      console.log(`[messageStore] Making ${config.method?.toUpperCase()} request to ${config.url}`)
      console.log('[messageStore] Request headers:', config.headers)
      console.log('[messageStore] Request data:', config.data || config.params || null)
      return config
    } catch (error) {
      console.error('[messageStore] Aborting request due to auth error:', error)
      return Promise.reject(error)
    }
  })

  // Response interceptor
  apiClient.interceptors.response.use(
    response => {
      console.log(`[messageStore] Response from ${response.config.url}:`, response.data)
      return response
    },
    error => {
      if (error.response) {
        console.error('[messageStore] API Error:', {
          status: error.response.status,
          data: error.response.data,
          url: error.config.url
        })
      } else {
        console.error('[messageStore] Network or CORS error:', error.message)
      }
      return Promise.reject(error)
    }
  )

  // Fetch all conversations
  const fetchUserConversations = async () => {
    try {
      console.log('[messageStore] fetchUserConversations() called')
      const response = await apiClient.get('/conversations')
      return response.data
    } catch (err) {
      console.error('[messageStore] Fetch conversations error:', err)
      return []
    }
  }

  // Fetch one conversation
  const fetchConversationWithUser = async (itemId, withUserId) => {
    try {
      console.log('[messageStore] fetchConversationWithUser() called with:', { itemId, withUserId })
      const response = await apiClient.get('/conversation', {
        params: { itemId, withUserId }
      })
      return response.data
    } catch (err) {
      console.error('[messageStore] Fetch conversation error:', err)
      return []
    }
  }

  // Send message
  const sendMessage = async (itemId, receiverId, messageText) => {
    try {
      const payload = { itemId, receiverId, messageText }
      console.log('[messageStore] sendMessage() called with:', payload)
      await apiClient.post('/send', payload)
      console.log('[messageStore] Message sent successfully')
      return true
    } catch (error) {
      console.error('[messageStore] Send message error:', error)
      return false
    }
  }

  return {
    fetchUserConversations,
    fetchConversationWithUser,
    sendMessage
  }
})
