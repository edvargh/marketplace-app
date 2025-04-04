<template>
  <div class="RegisterPage">
    <div v-if="showSuccess" class="success-notification">
      Registration successful! Redirecting to login...
    </div>

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
        :hasError="!!emailError"
        required
      />
      <p v-if="emailError" class="input-error-text">{{ emailError }}</p>

      <label for="phoneNumber">Telephone Number</label>
      <InputBox
        type="tel"
        id="phoneNumber"
        v-model="phoneNumber"
        placeholder="Enter your telephone number"
        :disabled="isSubmitting"
        :hasError="!!emailError"
        required
      />
      <p v-if="phoneError" class="input-error-text">{{ phoneError }}</p>

      <label for="password">Password</label>
      <InputBox
        type="password"
        id="password"
        v-model="password"
        placeholder="Enter your password"
        :disabled="isSubmitting"
        :hasError="!!phoneError"
        required
      />
      <p v-if="passwordError" class="input-error-text">{{ passwordError }}</p>


      <label for="confirmPassword">Confirm Password</label>
      <InputBox
        type="password"
        id="confirmPassword"
        v-model="confirmPassword"
        placeholder="Confirm your password"
        :disabled="isSubmitting"
        :hasError="!!confirmPasswordError"
        required
      />
      <p v-if="confirmPasswordError" class="input-error-text">{{ confirmPasswordError }}</p>

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
import { ref, computed, watch } from 'vue'
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

//Error messages
const emailError = ref('')
const phoneError = ref('')
const passwordError = ref('')
const confirmPasswordError = ref('')

watch(email, (newValue) => {
  if (!newValue) {
    emailError.value = ''
    return
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newValue)) {
    emailError.value = 'Please enter a valid email address'
  } else {
    emailError.value = ''
  }
})

watch(phoneNumber, (newValue) => {
  if (!newValue) {
    phoneError.value = ''
    return
  }
  if (!/^\d+$/.test(newValue)) {
    phoneError.value = 'Phone number must contain only digits'
  } else if (newValue.length < 8) {
    phoneError.value = 'Phone number must be at least 8 digits'
  } else {
    phoneError.value = ''
  }
})

watch(password, (newValue) => {
  if (!newValue) {
    passwordError.value = ''
    return
  }
  if (newValue.length < 8) {
    passwordError.value = 'Password must be at least 8 characters'
  } else {
    passwordError.value = ''
  }
})


watch(confirmPassword, (newValue) => {
  if (!newValue) {
    confirmPasswordError.value = ''
    return
  }
  if (newValue !== password.value) {
    confirmPasswordError.value = 'Passwords do not match'
  } else {
    confirmPasswordError.value = ''
  }
})

const hasErrors = computed(() => {
  return !!(
    emailError.value ||
    phoneError.value ||
    passwordError.value ||
    confirmPasswordError.value ||
    !fullName.value ||
    !email.value ||
    !phoneNumber.value ||
    !password.value ||
    !confirmPassword.value
  )
})

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
  