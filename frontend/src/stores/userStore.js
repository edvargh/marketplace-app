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


  const updateUser = async (rawFormData) => {
    // 1) Grab the token (required for the Authorization header)
    const token = localStorage.getItem('token')
    if (!token) throw new Error('No authentication token found')

    // 2) If no user is loaded from store, we can’t proceed
    const currentUser = user.value
    if (!currentUser?.id) {
      console.error('[UpdateUser] Missing user ID - not authenticated')
      throw new Error('Not authenticated')
    }

    // 3) Build the formData, just like itemStore
    console.log('[UpdateUser] Building FormData just like itemStore...')

    const formDataToSend = new FormData()

    // We'll create an object for the "dto" field
    // Notice we are using the same keys as your Java `UserUpdateDto`
    const userData = {
      fullName: rawFormData.fullName,
      email: rawFormData.email,
      password: rawFormData.password,
      phoneNumber: rawFormData.phoneNumber,
      preferredLanguage: rawFormData.language,
    }

    // Turn the userData object into a JSON blob and append as 'dto'
    formDataToSend.append(
      'dto',
      new Blob([JSON.stringify(userData)], { type: 'application/json' })
    )

    // 4) If the user selected a new profile picture file, append it
    if (rawFormData.profilePicture && rawFormData.profilePicture instanceof File) {
      console.log('[UpdateUser] Appending profilePicture file:', rawFormData.profilePicture.name)
      formDataToSend.append('profilePicture', rawFormData.profilePicture)
    } else {
      console.log('[UpdateUser] No new profile picture selected')
    }

    // 5) Perform the fetch PUT request
    console.log('[UpdateUser] Sending request to /api/users/' + currentUser.id)
    const response = await fetch(`http://localhost:8080/api/users/${currentUser.id}`, {
      method: 'PUT',
      headers: {
        // Let the browser set Content-Type/boundary automatically
        'Authorization': `Bearer ${token}`
      },
      body: formDataToSend
    })

    // 6) Check for errors
    if (!response.ok) {
      const errorText = await response.text()
      console.error('[UpdateUser] Update failed:', errorText)
      try {
        const errorData = JSON.parse(errorText)
        throw new Error(errorData.message || 'Update failed')
      } catch {
        throw new Error(errorText || 'Update failed')
      }
    }

    // 7) Success! parse the updated user data
    const updatedUser = await response.json()
    user.value = updatedUser
    localStorage.setItem('user', JSON.stringify(updatedUser))

    console.log('[UpdateUser] Success. Updated user:', updatedUser)
    return updatedUser
  }
  

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