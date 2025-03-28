import { ref } from 'vue'
import { useRouter } from 'vue-router'

const user = ref(null)
const isAuthenticated = ref(false)

export function userAuth() {
  const login = async (email, password) => {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.warn('[Login Failed Resoinse]', errorData)
        throw new Error(errorData.message || 'Login failed')
      }

      const data = await response.json()
      console.log('[Login Success]', data)

      localStorage.setItem('user', JSON.stringify(data))
      user.value = data
      isAuthenticated.value = true

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
    logout,
    checkAuth
  }
}