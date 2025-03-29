import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const isAuthenticated = ref(false)

  const login = async (email, password) => {
    const response = await fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Login failed')
    }

    const data = await response.json()
    localStorage.setItem('user', JSON.stringify(data))
    user.value = data
    isAuthenticated.value = true
  }

  const register = async (email, password, telephonenumber) => {
    const response = await fetch('http://localhost:8080/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, telephonenumber })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Registration failed')
    }

    const data = await response.json()
    return data 
  }

  const logout = () => {
    localStorage.removeItem('user')
    user.value = null
    isAuthenticated.value = false
  }

  const checkAuth = () => {
    const saved = localStorage.getItem('user')
    if (saved) {
      try {
        user.value = JSON.parse(saved)
        isAuthenticated.value = true
      } catch {
        localStorage.removeItem('user')
      }
    }
  }

  return {
    user,
    isAuthenticated,
    login,
    register,
    logout,
    checkAuth
  }
})
