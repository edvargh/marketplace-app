import { defineStore } from 'pinia'
import { ref } from 'vue'
import { errorMessages } from 'vue/compiler-sfc'

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
        let errorMessage = 'login failed'
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorMessage
    } catch (e) {
        errorMessage = 'Oops! Email or password is incorrect'
    } 
      throw new Error(errorMessage)    
    }

    const data = await response.json()
    localStorage.setItem('user', JSON.stringify(data))
    user.value = data
    isAuthenticated.value = true
  }

  const register = async (fullName, email, password, phoneNumber) => {
    const response = await fetch('http://localhost:8080/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, email, password, phoneNumber })
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
