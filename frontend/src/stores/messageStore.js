import { defineStore } from 'pinia'
import axios from 'axios'

export const useMessageStore = defineStore('messageStore', () => {
  const API_BASE = 'http://localhost:8080/api/messages'

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
      const response = await axios.get(`${API_BASE}/conversations`, { headers })
      return response.data
    } catch (err) {
      console.error('Error fetching user conversations:', err)
      return []
    }
  }

  const fetchConversationWithUser = async (itemId, withUserId) => {
    try {
      const headers = getAuthHeaders()
      const response = await axios.get(`${API_BASE}/conversation`, {
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
      const response = await axios.post(`${API_BASE}/send`, payload, { headers })
      return response.status === 200
    } catch (err) {
      console.error('Error sending message:', err)
      return false
    }
  }

  return {
    fetchUserConversations,
    fetchConversationWithUser,
    sendMessage
  }
})
