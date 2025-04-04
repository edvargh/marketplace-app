<template>
  <LoadingState :loading="loading" :error="error" loadingMessage="Loading your profile..."/>

  <div class="profile-view">
    <h1>{{t("profile.Profile")}}</h1> <h1> {{ fullName }}</h1>

    <div class= "profile-picture-wrapper">
      <div class="profile-picture-container">
        <img
            :src="profileImage"
            alt="Profile Picture"
            class ="profile-picture"
            @click= "handleEdit"
            title = "Change profile picture" />
        <EditIcon @click="handleEdit" class="edit-icon" />
        <input
        type="file"
        ref="fileInput"
        accept="image/*"
        @change="handleFileChange"
        style="display: none;"
        />
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

      <p v-if="passwordMismatch" class="input-error-text">{{t("profile.Passwords-do-not-match")}}</p>

      <div class="SelectBox">
          <label for="language">{{ t('profile.language') }}</label>
          <select id="language" v-model="language" class="dropdown-select">
          <option disabled value="">{{ t('profile.Select-your-language')}}</option>
          <option value="english">English</option>
          <option value="norwegian">Norwegian</option>
        </select>
      </div>

      <button type="submit" :disabled="!canSubmit">
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
import LoadingState from "@/components/LoadingState.vue"

const userStore = useUserStore()
const { t, locale } = useI18n()

const fullName = ref('')
const email = ref('')
const phoneNumber = ref('')
const password = ref('')
const confirmPassword = ref('')
const language = ref('')
const errorMessage = ref('')
const loading = ref(true)
const error = ref(null)
const isSubmitting = ref(false)
const showPopup = ref(false)

// This holds the displayed image URL for preview
const profileImage = ref('/default-picture.jpg')
// This holds the actual file object for the new profile pic
const selectedImageFile = ref(null)

// This function triggers the hidden file input
const handleEdit = () => {
  fileInput.value?.click()
}

// Listen for file changes
const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (!file) return

  selectedImageFile.value = file
  profileImage.value = URL.createObjectURL(file)
}

// Reference to hidden file input
const fileInput = ref(null)

onMounted(() => {
  console.log('[ProfileView] userStore fields:', Object.keys(userStore.user || {}))
  
  loading.value = true
  if (userStore.user) {
    fullName.value = userStore.user.fullName || ''
    email.value = userStore.user.email || ''
    phoneNumber.value = userStore.user.phoneNumber || ''
    language.value = userStore.user.language || 'english'
    locale.value = userStore.user.language || 'english'
    profileImage.value = userStore.user.profilePicture || '/default-picture.jpg'
  }
  loading.value = false
})

// Simple computed to check if passwords mismatch
const passwordMismatch = computed(() => {
  return password.value !== confirmPassword.value && confirmPassword.value !== ''
})
const canSubmit = computed(() => !passwordMismatch.value && !isSubmitting.value)



// handleUpdateProfile
const handleUpdateProfile = async () => {
  try {
    // 1) Gather user input
    const rawFormData = {
      fullName: fullName.value,
      email: email.value,
      password: password.value || undefined,
      phoneNumber: phoneNumber.value,
      language: language.value,
      profilePicture: selectedImageFile.value // File or null
    }

    // 2) Just pass that object to updateUser
    await userStore.updateUser(rawFormData)

    // 3) Done
    showPopup.value = true
    console.log('[ProfileView] Profile updated successfully!')
  } catch (err) {
    console.error('[ProfileView] Update failed:', err)
    errorMessage.value = err.message
  }
}

</script>


<style scoped>
@import '../styles/users/ProfileView.css';
</style>