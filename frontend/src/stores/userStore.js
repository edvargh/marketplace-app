import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
if (!API_BASE_URL) {
  throw new Error('VITE_API_BASE_URL is not defined. Please set it in your .env file.');
}

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const isAuthenticated = ref(false)
  const role = computed(() => user.value?.role || null)

  const login = async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
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

    return data.user
  }

  const register = async (fullName, email, password, phoneNumber) => {
    try {      
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fullName, email, password, phoneNumber })
      });      
      
      const data = await response.json();
      
      if (!response.ok) {
        if (data.error) {          
          if (data.error.includes("Email already in use")) {
            throw new Error("This email address is already registered. Please use a different email or try logging in.");
          } else if (data.error.includes("Phone number already in use")) {
            throw new Error("This phone number is already registered. Please use a different number.");
          } else {
            throw new Error(data.error);
          }
        } else {
          throw new Error(`Registration failed: ${response.statusText}`);
        }
      }
      return data;
    } catch (error) {
      throw error;
    }
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
      const response = await fetch(`${API_BASE_URL}/api/users/me`, {
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
      return data
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

    const response = await fetch(`${API_BASE_URL}/api/users/${currentUser.id}`, {
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
  
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
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

  const getProfileImageUrl = (profileImagePath) => {
    if (!profileImagePath || typeof profileImagePath !== 'string') 
      return '/default-picture.jpg';
    
    if (profileImagePath.startsWith('http://') || profileImagePath.startsWith('https://')) {
      return profileImagePath;
    }
    
    return `${API_BASE_URL}/uploads/${profileImagePath}`;
  }

  const getCurrentUserProfileImageUrl = () => {
    if (user.value?.profilePicture) {
      return getProfileImageUrl(user.value.profilePicture);
    }
    return getProfileImageUrl(user.value?.profileImage);
  }

  const getUserProfileImageUrl = async (userId) => {
    try {
      if (user.value?.id === userId) {
        return getCurrentUserProfileImageUrl();
      }
      
      const userData = await getUserById(userId);
      if (userData.profilePicture) {
        return getProfileImageUrl(userData.profilePicture);
      }
      return getProfileImageUrl(userData.profileImage);
    } catch (error) {
      return '/default-picture.jpg';
    }
  }

  return {
    user,
    role,
    isAuthenticated,
    login,
    register,
    logout,
    checkAuth,
    updateUser,
    getUserById,
    getProfileImageUrl,
    getCurrentUserProfileImageUrl,
    getUserProfileImageUrl
  }
})