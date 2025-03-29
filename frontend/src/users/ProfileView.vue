<template>
    <div class="profile-view">
      <h1>Profile - {{ username }}</h1>
  
      <div class="profile-picture">
        <img src="https://via.placeholder.com/150" alt="Profile Picture" />
      </div>
  
      <h2>Edit profile</h2>
  
      <form @submit.prevent="handleUpdateProfile">
        <label for="username">Username</label>
        <InputBox>
          <input type="text" id="username" v-model="username" placeholder="Username" />
        </InputBox>
  
        <label for="password">Password</label>
        <InputBox>
          <input type="password" id="password" v-model="password" placeholder="Password" />
        </InputBox>
  
        <label for="email">Email</label>
        <InputBox>
          <input type="email" id="email" v-model="email" placeholder="Email" />
        </InputBox>
  
        <label for="telephonenumber">Telephone Number</label>
        <InputBox>
          <input type="tel" id="telephonenumber" v-model="telephonenumber" placeholder="Telephone number" />
        </InputBox>
  
        <label for="bio">Bio</label>
        <InputBox>
          <textarea id="bio" v-model="bio" placeholder="Bio" rows="3"></textarea>
        </InputBox>
  
        <label for="language">Language</label>
        <InputBox>
          <input type="text" id="language" v-model="language" placeholder="Language" />
        </InputBox>
  
        <button type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? 'Updating...' : 'Update Profile' }}
        </button>
  
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import InputBox from '@/components/InputBox.vue'
  import { useRouter } from 'vue-router'
  
  const username = ref('')
  const password = ref('')
  const email = ref('')
  const telephonenumber = ref('')
  const bio = ref('')
  const language = ref('')
  const errorMessage = ref('')
  const isSubmitting = ref(false)
  
  const router = useRouter()
  
  const handleUpdateProfile = async () => {
    isSubmitting.value = true
    errorMessage.value = ''
  
    try {
      const response = await fetch('http://localhost:8080/api/user/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.value,
          password: password.value,
          email: email.value,
          telephonenumber: telephonenumber.value,
          bio: bio.value,
          language: language.value
        })
      })
  
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Update failed')
      }
  
      const data = await response.json()
      console.log('[Update Success]', data)
    } catch (err) {
      console.error('[Update Error]', err)
      errorMessage.value = err.message
    } finally {
      isSubmitting.value = false
    }
  }
  </script> 

<style scoped>
@import '../styles/ProfileView.css';
</style>