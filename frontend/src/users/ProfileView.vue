<template>
  <div class="profile-view">
    <h1>Profile - {{ fullName }}</h1>

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


    <form @submit.prevent="handleUpdateProfile">
      <label for="fullName">{{ t('profile.fullName') }}</label>
      <InputBox
        label="fullName"
        id="fullName"
        v-model="fullName"
      />

      <label for="email">{{ t('profile.email') }}</label>
      <InputBox
        label="Email"
        id="email"
        type="email"
        v-model="email"
      />

      <label for="phoneNumber">{{ t('profile.phoneNumber') }}</label>
      <InputBox
        id="phoneNumber"
        type="phoneNumber"
        v-model="phoneNumber"
      />

      <label for="password">{{ t('profile.password') }}</label>
      <InputBox
      id="password"
      type="password"
      v-model="password"
      />

      <label for="confirmPassword">{{ t('profile.confirmPassword') }}</label>
      <InputBox
      id="confirmPassword"
      type="password"
      v-model="confirmPassword"
      :class="{ 'input-error': passwordMismatch }" 
      />

      <p v-if="passwordMismatch" class="input-error-text">Passwords do not match</p>

      <div class="SelectBox">
          <label for="language">{{ t('profile.language') }}</label>
          <select id="language" v-model="language" class="dropdown-select">
          <option disabled value="">Select your language</option>
          <option value="english">English</option>
          <option value="norwegian">Norwegian</option>
        </select>
      </div>

      <button type="submit" :disabled="!canSubmit">
        {{ isSubmitting ? 'Updating...' : 'Update Profile' }}
      </button>
      <NotificationBanner
        v-if="showPopup"
        :message="t('profile.successMessage')"
        type="success"
        @close="showPopup = false"
      />
      
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
    </form>
  </div>

</template>


<script setup>
import { ref, computed, onMounted} from 'vue'
import { useUserStore } from '@/stores/userStore'
import { useI18n } from 'vue-i18n'
import InputBox from '@/components/InputBox.vue'
import EditIcon from '@/components/EditIcon.vue'
import NotificationBanner from '@/components/NotificationBanner.vue'

const fullName = ref('')
const email = ref('')
const phoneNumber = ref('')
const password = ref('')
const confirmPassword = ref('')
const language = ref('')
const isSubmitting = ref(false)
const errorMessage = ref('')
const profileImage = ref('/default-picture.jpg')

const userStore = useUserStore()
const { t, locale } = useI18n()
const showPopup = ref(false)

onMounted(() => {
  if (userStore.user) {
    fullName.value = userStore.user.fullName || ''
    email.value = userStore.user.email || ''
    phoneNumber.value = userStore.user.phoneNumber || ''
    language.value = userStore.user.language || ''
    locale.value = userStore.user.language || 'english'
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
  await userStore.updateUser({
    fullName: fullName.value,
    email: email.value,
    phoneNumber: phoneNumber.value,
    language: language.value,
    password: password.value || undefined
  })

  locale.value = language.value
  showPopup.value = true

  console.log('[Update Success]')
} catch (err) {
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