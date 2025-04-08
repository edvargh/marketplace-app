<template>
  <LoadingState :loading="loading" :error="error" loadingMessage="Loading your profile..."/>

  <div class="profile-view">
    <h1>{{ t("profile.Profile") }}</h1>
    <h1>{{ fullName }}</h1>

    <div class="profile-picture-wrapper">
      <div class="profile-picture-container">
        <img
          :src="profileImage"
          alt="Profile Picture"
          class="profile-picture"
          @click="handleEdit"
          title="Change profile picture"
        />
        <EditIcon @click="handleEdit" class="edit-icon" />
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          style="display: none;"
          @change="handleFileChange"
        />
      </div>
    </div>

    <form @submit.prevent="handleUpdateProfile">
      <label for="fullName">{{ t('profile.fullName') }}</label>
      <InputBox id="fullName" v-model="fullName" :class="{ 'input-error': fullName.trim() === '' && formTouched }" />
      <p v-if="fullName.trim() === '' && formTouched" class="input-error-text">
      {{ t("profile.fullNameRequire") || "Full name is required" }}
      </p>

      <label for="email">{{ t('profile.email') }}</label>
      <InputBox id="email" type="email" v-model="email" :class="{ 'input-error': !emailValid && formTouched }" />
      <p v-if="!emailValid && formTouched" class="input-error-text">
      {{ t("profile.email") || "Please enter a valid email address" }}
      </p>

      <label for="phoneNumber">{{ t('profile.phoneNumber') }}</label>
      <InputBox id="phoneNumber" v-model="phoneNumber" />

      <label for="password">{{ t('profile.password') }}</label>
      <InputBox id="password" type="password" v-model="password" :class="{ 'input-error': passwordFieldsTouched && !passwordsValid }" />

      <label for="confirmPassword">{{ t('profile.confirmPassword') }}</label>
      <InputBox
      id="confirmPassword"
      type="password"
      v-model="confirmPassword"
      :class="{ 'input-error': passwordFieldsTouched && !passwordsValid }"
      />
      <p v-if="passwordFieldsTouched && !passwordsValid" class="input-error-text">
      {{ passwordMismatch ? t("profile.Passwords-do-not-match") : t("profile.bothPasswordsRequired") || "Both password fields must be filled" }}
      </p>

      <label for="language">{{ t('profile.language') }}</label>
      <SelectBox
        v-model="language"
        :options="languageOptions"
        :placeholder="t('profile.Select-your-language')"
      />

      <button type="submit" :disabled="!canSubmit" class="action-button button-primary">
        {{ isSubmitting ? t('profile.updating') : t('profile.updateProfile') }}
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
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { useI18n } from 'vue-i18n'
import InputBox from '@/components/InputBox.vue'
import EditIcon from '@/components/EditIcon.vue'
import NotificationBanner from '@/components/NotificationBanner.vue'
import LoadingState from '@/components/LoadingState.vue'
import SelectBox from '@/components/SelectBox.vue'

const userStore = useUserStore()
const { t, locale } = useI18n()

const fullName = ref('')
const email = ref('')
const phoneNumber = ref('')
const password = ref('')
const confirmPassword = ref('')
const language = ref('')

const formTouched = ref(false)
const errorMessage = ref('')
const loading = ref(true)
const error = ref(null)
const isSubmitting = ref(false)
const showPopup = ref(false)

const profileImage = ref('/default-picture.jpg')
const selectedImageFile = ref(null)
const fileInput = ref(null)

const languageOptions = [
  { label: 'English', value: 'english' },
  { label: 'Norwegian', value: 'norwegian' }
]

const passwordFieldsTouched = computed(() => 
  password.value.length > 0 || confirmPassword.value.length > 0
)

const passwordsValid = computed(() => {
  if (!passwordFieldsTouched.value) return true
  return password.value.length > 0 && password.value === confirmPassword.value
})

const emailValid = computed(() => {
  if (!email.value) return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.value)
})

const passwordMismatch = computed(() => (
  password.value !== confirmPassword.value && confirmPassword.value !== ''
))

const canSubmit = computed(() => 
  fullName.value.trim() !== '' && 
  emailValid.value && 
  passwordsValid.value && 
  !isSubmitting.value
)

onMounted(() => {
  loading.value = true
  if (userStore.user) {
    fullName.value = userStore.user.fullName || ''
    email.value = userStore.user.email || ''
    phoneNumber.value = userStore.user.phoneNumber || ''
    language.value = userStore.user.preferredLanguage || 'english'
    locale.value = userStore.user.preferredLanguage || 'english'
    profileImage.value = userStore.user.profilePicture || '/default-picture.jpg'
  }
  loading.value = false
})

const handleEdit = () => fileInput.value?.click()

const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    selectedImageFile.value = file
    profileImage.value = URL.createObjectURL(file)
  }
}

const handleUpdateProfile = async () => {
  formTouched.value = true


  if (!canSubmit.value) {
    errorMessage.value = 'Please fill in all required fields correctly.'
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''

  try {
    const updateData = {
      fullName: fullName.value,
      email: email.value,
      password: password.value || undefined,
      phoneNumber: phoneNumber.value,
      preferredLanguage: language.value,
      profilePicture: selectedImageFile.value 
    }

    await userStore.updateUser(updateData)
    locale.value = language.value
    showPopup.value = true
  } catch (err) {
    errorMessage.value = err.message
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
@import '../styles/users/ProfileView.css';
</style>
