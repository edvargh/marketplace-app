<template>
    <div class="profile-view">
      <h1>Profile - {{ username }}</h1>
  
    <div class= "profile-picture-wrapper">
      <div class="profile-picture-container">
        <img 
            :src="profileImage" 
            alt="Profile Picture" 
            class ="profile-picture"
            @click= "handleEdit"
            title = "Change profile picture" />
        <EditIcon @click="handleEdit" class="edit-icon" />
      </div>
    </div>
  
      <h2>Edit profile</h2>
  
      <form @submit.prevent="handleUpdateProfile">
        <label>Username</label>
        <InputBox
          label="Username"
          id="username"
          v-model="username"
        />
  
        <label for="email">Email</label>
        <InputBox
          label="Email"
          id="email"
          type="email"
          v-model="email"
        />
  
        <label for="telephonenumber">Telephone Number</label>
        <InputBox
          label="Telephone Number"
          id="telephonenumber"
          type="tel"
          v-model="telephonenumber"
        />
  
        <label for="bio">Bio</label>
        <InputBox
          label="Bio"
          id="bio"
        >
          <textarea
            id="bio"
            v-model="bio"
            rows="3"
            class="InputBox-input"
          ></textarea>
        </InputBox>

        <label for="password">Password</label>
        <InputBox
        id="password"
        type="password"
        v-model="password"
        />

        <label for="confirmPassword">Confirm Password</label>
        <InputBox
        id="confirmPassword"
        type="password"
        v-model="confirmPassword"
        :class="{ 'input-error': passwordMismatch }" 
        />

        <p v-if="passwordMismatch" class="input-error-text">Passwords do not match</p>

        <div class="SelectBox">
          <label for="language">Language</label>
          <select id="language" v-model="language" class="dropdown-select">
            <option disabled value="">Select your language</option>
            <option value="english">English</option>
            <option value="norwegian">Norwegian</option>
          </select>
        </div>
  
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
  import { ref, computed, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { useUserStore } from '@/stores/userStore'
  import InputBox from '@/components/InputBox.vue'
  import EditIcon from '@/components/EditIcon.vue'
  
  const username = ref('')
  const bio = ref('')
  const email = ref('')
  const telephonenumber = ref('')
  const password = ref('')
  const confirmPassword = ref('')
  const language = ref('')
  const isSubmitting = ref(false)
  const errorMessage = ref('')
  const profileImage = ref('/default-picture.jpg')
  
  const router = useRouter()
  const userStore = useUserStore()
  
  onMounted(() => {
    if (userStore.user) {
      username.value = userStore.user.fullName || ''
      email.value = userStore.user.email || ''
      telephonenumber.value = userStore.user.phoneNumber || ''
      bio.value = userStore.user.bio || ''
      language.value = userStore.user.language || ''
    }
  })
  
  const passwordMismatch = computed(() => {
    return password.value !== confirmPassword.value && confirmPassword.value !== ''
  })
  
  const canSubmit = computed(() => !passwordMismatch.value && !isSubmitting.value)
  
  const handleUpdateProfile = async () => {
    if (passwordMismatch.value) {
      errorMessage.value = 'Passwords do not match'
      return
    }
  
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
          language: language.value,
        }),
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
  
  const handleEdit = () => {
    console.log('Edit icon clicked')
  }
  </script>


<style scoped>
@import '../styles/ProfileView.css';
</style>