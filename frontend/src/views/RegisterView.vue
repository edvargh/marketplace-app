<template>
  <div class="RegisterPage">
    <div v-if="showSuccess" class="success-notification">
      Registration successful! Redirecting to login...
    </div>

    <h1>Register new account</h1>
    <form @submit.prevent="RegistrationLogic">

      <label for="fullName">Full Name</label>
      <InputBox
        id="fullName"
        v-model="fullName"
        placeholder="Enter your full name"
        :disabled="isSubmitting"
        required
      />
      <p v-if="fullNameError" class="error-message">{{ fullNameError }}</p>

      <label for="email">Email</label>
      <InputBox
        type="email"
        id="email"
        v-model="email"
        placeholder="Enter your email"
        :disabled="isSubmitting"
        required
      />
      <p v-if="emailError" class="error-message">{{ emailError }}</p>

      <label for="phoneNumber">Telephone Number</label>
      <InputBox
        type="number"
        id="phoneNumber"
        v-model="phoneNumber"
        placeholder="Enter your telephone number"
        :disabled="isSubmitting"
        required
      />
      <p v-if="phoneError" class="error-message">{{ phoneError }}</p>

      <label for="password">Password</label>
      <InputBox
        type="password"
        id="password"
        v-model="password"
        placeholder="Enter your password"
        :disabled="isSubmitting"
        required
      />
      <p v-if="passwordError" class="error-message">{{ passwordError }}</p>

      <label for="confirmPassword">Confirm Password</label>
      <InputBox
        type="password"
        id="confirmPassword"
        v-model="confirmPassword"
        placeholder="Confirm your password"
        :disabled="isSubmitting"
        required
      />
      <p v-if="confirmPasswordError" class="error-message">{{ confirmPasswordError }}</p>

      <button type="submit" :disabled="isSubmitting || hasErrors">
        {{ isSubmitting ? 'Registering...' : 'Register' }}
      </button>

      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
      <div>
        <p class="AlreadyHaveAccountText">
          Already have an account? <router-link to="/login">Login here</router-link>
        </p>
      </div>
    </form>
  </div>
</template>
  
<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import InputBox from '@/components/InputBox.vue'

const router = useRouter()
const userStore = useUserStore()

const fullName = ref('')
const email = ref('')
const phoneNumber = ref('')
const password = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')
const isSubmitting = ref(false)
const maxFullNameLength = 30
const phoneNumberLength = 8
const passwordLength = 8

const fullNameError = computed(() => {
  if (fullName.value.length > maxFullNameLength)
    return `Full name cannot exceed ${maxFullNameLength} characters`
  return ""
})

const emailError = computed(() => {
  if (email.value === "") return
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.value)
    ? ""
    : "Please enter a valid email address"
})

const phoneError = computed(() => {
  if (phoneNumber.value === "") return
  return phoneNumber.value.length === phoneNumberLength
    ? ""
    : "Phone number must be 8 digits"
})

const passwordError = computed(() => {
  const pass = password.value
  if (pass === "") return
  return pass.length >= passwordLength ? "" : "Password must be at least 8 characters"
})

const confirmPasswordError = computed(() => {
  const confirm = confirmPassword.value
  if (confirm === "") return
  return confirm === password.value ? "" : "Passwords do not match"
})

const hasErrors = computed(() =>
  fullNameError.value !== "" ||
  emailError.value !== "" ||
  phoneError.value !== "" ||
  passwordError.value !== "" ||
  confirmPasswordError.value !== "" ||
  !fullName.value ||
  !email.value ||
  !phoneNumber.value ||
  !password.value ||
  !confirmPassword.value
)

const showSuccess = ref(false)

const RegistrationLogic = async () => {
  errorMessage.value = ''
  isSubmitting.value = true

  try {
    await userStore.register(fullName.value, email.value, password.value, phoneNumber.value)
    showSuccess.value = true
    setTimeout(() => {
      router.push('/login')
    }, 2000) 
  } catch (err) {
    errorMessage.value = err.message
  } finally {
    isSubmitting.value = false
  }
}
</script>
  
<style scoped>
@import '../styles/views/RegisterView.css';
</style>
  