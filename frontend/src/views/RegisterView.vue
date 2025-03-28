<template>
  <div class="RegisterPage">
    <h1>Register new account</h1>
    <form @submit.prevent="RegistrationLogic">
      <label for="email">Email</label>
      <InputBox
        type="email"
        id="email"
        v-model="email"
        placeholder="Enter your email"
        :disabled="isSubmitting"
        required
      />

      <label for="telephonenumber">Telephone Number</label>
      <InputBox
        type="tel"
        id="telephonenumber"
        v-model="telephonenumber"
        placeholder="Enter your telephone number"
        :disabled="isSubmitting"
        required
      />

      <label for="password">Password</label>
      <InputBox
        type="password"
        id="password"
        v-model="password"
        placeholder="Enter your password"
        :disabled="isSubmitting"
        required
      />

      <label for="confirmPassword">Confirm Password</label>
      <InputBox
        type="password"
        id="confirmPassword"
        v-model="confirmPassword"
        placeholder="Confirm your password"
        :disabled="isSubmitting"
        required
      />

      <button type="submit" :disabled="isSubmitting">
        {{ isSubmitting ? 'Registering...' : 'Register' }}
      </button>

      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
    </form>
  </div>
</template>
  
  <script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import InputBox from '@/components/InputBox.vue'
  
  const email = ref('')
  const telephonenumber = ref('')
  const password = ref('')
  const confirmPassword = ref('')
  const errorMessage = ref('')
  const isSubmitting = ref(false)
  
  const router = useRouter()
  
  const RegistrationLogic = async () => {
    errorMessage.value = ''
    isSubmitting.value = true
  
    if (password.value !== confirmPassword.value) {
      errorMessage.value = 'Passwords do not match'
      isSubmitting.value = false
      return
    }
  
    try {
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.value.trim(),
          password: password.value,
          telephonenumber: telephonenumber.value.trim(),
        })
      })
  
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Registration failed')
      }
  
      const data = await response.json()
      console.log('[Registration Success]', data)
  
      await router.push('/login')
    } catch (err) {
      console.error('[Registration Error]', err)
      errorMessage.value = err.message
    } finally {
      isSubmitting.value = false
    }
  }
  </script>
  
  <style scoped>
  @import '../styles/RegisterView.css';
  </style>
  