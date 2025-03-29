<template>
  <div class="RegisterPage">
    <h1>Register new account</h1>
    <form @submit.prevent="RegistrationLogic">

      <label for = "fullName">Full Name</label>
      <InputBox
        type="text"
        id="fullName"
        v-model="fullName"
        placeholder="Enter your full name"
        :disabled="isSubmitting"
        required
      />

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
import { useUserStore } from '@/stores/userStore'
import InputBox from '@/components/InputBox.vue'

const router = useRouter()
const userStore = useUserStore()

const fullName = ref('')
const email = ref('')
const telephonenumber = ref('')
const password = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')
const isSubmitting = ref(false)

const RegistrationLogic = async () => {
  errorMessage.value = ''
  isSubmitting.value = true

  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match'
    isSubmitting.value = false
    return
  }

  try {
    await userStore.register(fullName.value, email.value, password.value, telephonenumber.value)
    await router.push('/login')
  } catch (err) {
    errorMessage.value = err.message
  } finally {
    isSubmitting.value = false
  }
}
</script>
  
  <style scoped>
  @import '../styles/RegisterView.css';
  </style>
  