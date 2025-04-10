<template>
  <div class="logInWrapper">
    <div class="logInPage">
      <h1>Log In</h1>

      <form @submit.prevent="handleLogin">
        <label for="email">Email</label>
        <InputBox
          type="email"
          id="email"
          name="email"
          v-model="email"
          required
          placeholder="Enter your email"
          :disabled="isSubmitting"
        />

        <label for="password">Password</label>
        <InputBox
          type="password"
          id="password"
          name="password"
          v-model="password"
          required
          placeholder="Enter your password"
          :disabled="isSubmitting"
        />

        <button type="submit" :disabled="isSubmitting" class="custom-button-filled">
          {{ isSubmitting ? 'Logging in...' : 'Log In' }}
        </button>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
      </form>

      <div>
        <p class="noAccountText">
          Don't have an account? <router-link to="/register">Sign Up</router-link>
        </p>
      </div>

      <div>
        <p class="home-page">
        Back to main welcome <router-link to="/">here</router-link>
        </p>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import InputBox from '@/components/InputBox.vue'

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const isSubmitting = ref(false)

const router = useRouter()
const userStore = useUserStore()

const handleLogin = async () => {
  isSubmitting.value = true
  errorMessage.value = ''

  if (!email.value || !password.value) {
  errorMessage.value = 'Email and password are required'
  isSubmitting.value = false
  return
}

  try {
    await userStore.login(email.value, password.value)
    await router.push('/')
  } catch (err) {
    errorMessage.value = err.message || 'Login failed'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
@import '../styles/views/LogInView.css';
</style>