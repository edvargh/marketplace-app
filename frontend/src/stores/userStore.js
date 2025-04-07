import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const isAuthenticated = ref(false)
  const role = computed(() => user.value?.role || null)

  const login = async (email, password) => {
    const response = await fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })

    if (!response.ok) {
      let errorMessage = 'Login failed'
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorMessage
      } catch {
        errorMessage = 'Oops! Email or password is incorrect'
      }
      throw new Error(errorMessage)
    }

    const data = await response.json()
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    user.value = data.user
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
    return await response.json()
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    user.value = null
    isAuthenticated.value = false
  }

  const checkAuth = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      isAuthenticated.value = false
      return
    }

    try {
      const response = await fetch('http://localhost:8080/api/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) throw new Error('Not authenticated')

      const data = await response.json()
      user.value = data
      localStorage.setItem('user', JSON.stringify(data))
      isAuthenticated.value = true
    } catch {
      logout()
    }
  }

  const updateUser = async (rawFormData) => {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('No authentication token found')

    const currentUser = user.value
    if (!currentUser?.id) throw new Error('Not authenticated')

    const formDataToSend = new FormData()

    const userData = {
      fullName: rawFormData.fullName,
      email: rawFormData.email,
      password: rawFormData.password,
      phoneNumber: rawFormData.phoneNumber,
      preferredLanguage: rawFormData.preferredLanguage,
    }
    formDataToSend.append(
      'dto',
      new Blob([JSON.stringify(userData)], { type: 'application/json' })
    )

    if (rawFormData.profilePicture instanceof File) {
      formDataToSend.append('profilePicture', rawFormData.profilePicture)
    }

    const response = await fetch(`http://localhost:8080/api/users/${currentUser.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formDataToSend
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => null)
      let errorMsg = errorText || 'Update failed'
      try {
        const errorData = JSON.parse(errorText)
        errorMsg = errorData.message || errorMsg
      } catch {}
      throw new Error(errorMsg)
    }

    const updatedUser = await response.json()
    user.value = updatedUser
    localStorage.setItem('user', JSON.stringify(updatedUser))
    return updatedUser
  }

  const getUserById = async (userId) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');
  
    const response = await fetch(`http://localhost:8080/api/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch user: ${errorText}`);
    }
  
    return await response.json(); 
  };

  return {
    user,
    role,
    isAuthenticated,
    login,
    register,
    logout,
    checkAuth,
    updateUser,
    getUserById
  }
})
