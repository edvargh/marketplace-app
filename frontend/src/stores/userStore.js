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
      let errorMessage = 'Login failed'
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorMessage
      } catch (e) {
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
    } catch (error) {
      logout()
    }
  }

  const updateUser = async (updateData) => {
    const token = localStorage.getItem('token');
    const currentUser = user.value;
    
    console.log('[UpdateUser] Current token:', token);
    console.log('[UpdateUser] Current user:', JSON.parse(JSON.stringify(currentUser)));
    console.log('[UpdateUser] Update data received:', updateData);
  
    if (!token || !currentUser?.id) {
      console.error('[UpdateUser] Missing token or user ID - not authenticated');
      throw new Error('Not authenticated');
    }
  
    try {
      const requestBody = {
        id: currentUser.id,
        fullName: updateData.fullName || currentUser.fullName,
        email: updateData.email || currentUser.email,
        phoneNumber: updateData.phoneNumber || currentUser.phoneNumber,
        language: updateData.language || currentUser.language,
        password: updateData.password ? updateData.password : undefined
      };
  
      console.log('[UpdateUser] Sending PUT request to /api/users/me with:', requestBody);
      const response = await fetch(`http://localhost:8080/api/users/${currentUser.id}`, {
        method: 'PUT',  
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });
  
      console.log('[UpdateUser] Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[UpdateUser] Update failed:', errorText);
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.message || 'Update failed');
        } catch {
          throw new Error(errorText || 'Update failed');
        }
      }
  
      const updatedUser = await response.json();
      console.log('[UpdateUser] Update successful:', updatedUser);
      
      // Update local state
      user.value = updatedUser;  // Complete replacement for PUT semantics
      localStorage.setItem('user', JSON.stringify(user.value));
      return updatedUser;
    } catch (error) {
      console.error('[UpdateUser] Error:', error);
      throw error;
    }
  };

  return {
    user,
    isAuthenticated,
    login,
    register,
    logout,
    checkAuth,
    updateUser 
  }
})