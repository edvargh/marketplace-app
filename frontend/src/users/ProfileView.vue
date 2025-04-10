<template>
  <LoadingState :loading="loading" :error="error" loadingMessage="Loading your profile..."/>
  <ErrorMessage v-if="!loading && errorMessage" :message="errorMessage" />

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
      <InputBox id="fullName" v-model="fullName" :placeholder="t('profile.placeholderName')" :disabled="isSubmitting"/>
      <p v-if="fullNameError" class="error-message">{{ fullNameError }}</p>

      <label for="email">{{ t('profile.email') }}</label>
      <InputBox id="email" type="email" v-model="email" :placeholder="t('profile.placeholderEmail')" :disabled="isSubmitting"/>
      <p v-if="emailError" class="error-message">{{ emailError }}</p>

      <label for="phoneNumber">{{ t('profile.phoneNumber') }}</label>
      <InputBox id="phoneNumber" type="number" v-model="phoneNumber" :placeholder="t('profile.placeholderPhone')" :disabled="isSubmitting"/>
      <p v-if="phoneError" class="error-message">{{ phoneError }}</p>

      <label for="password">{{ t('profile.password') }}</label>
      <InputBox id="password" type="password" v-model="password" :placeholder="t('profile.placeholderPass')" :disabled="isSubmitting"/>
      <p v-if="passwordTooShort" class="error-message">{{ t('profile.passwordTooShort') }}</p>

      <label for="confirmPassword">{{ t('profile.confirmPassword') }}</label>
      <InputBox
        id="confirmPassword"
        type="password"
        v-model="confirmPassword"
        :placeholder="t('profile.placeholderConfirmPass')"
        :disabled="isSubmitting"
      />
      <p v-if="passwordFieldsTouched && passwordsMismatch" class="error-message">
        {{ t("profile.Passwords-do-not-match") }}
      </p>

      <label for="language">{{ t('profile.language') }}</label>
      <SelectBox
        id="language"
        
        v-model="language"
        :options="languageOptions"
      />

      <button type="submit" :disabled="!canSubmit" class="action-button button-primary">
        {{ isSubmitting ? t("profile.updating") : t("profile.updateProfile") }}
      </button>

      <NotificationBanner
        v-if="showPopup"
        :message="t('profile.successMessage')"
        type="success"
        @close="showPopup = false"
      />
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

const errorMessage = ref('')
const loading = ref(true)
const error = ref(null)
const isSubmitting = ref(false)
const showPopup = ref(false)

const profileImage = ref('/default-picture.jpg')
const selectedImageFile = ref(null)
const fileInput = ref(null)
const maxFullNameLength = 30
const phoneNumberLength = 8
const passwordLength = 8;

const languageOptions = [
  { label: 'English', value: 'english' },
  { label: 'Norwegian', value: 'norwegian' }
]

const fullNameError = computed(() => {
  if (fullName.value === "") return t("profile.fullNameRequired")
  if (fullName.value.length > maxFullNameLength)
    return t("profile.fullNameTooLong", { maxLength: maxFullNameLength });
  return ""
})

const emailError = computed(() => {
  if (email.value === "") {
    return t("profile.emailRequired")
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.value)) {
      return t("profile.emailInvalid")
    }
  }
  return ""
})

const phoneError = computed(() => {
  if (phoneNumber.value === "") {
    return t("profile.phoneRequired")
  }
  if (phoneNumber.value.length !== phoneNumberLength) {
    return t("profile.phoneLength", { length: phoneNumberLength });
  }
  return ""
})

const passwordFieldsTouched = computed(() =>
  password.value.length > 0 || confirmPassword.value.length > 0
)

const passwordTooShort = computed(() =>
  password.value.length > 0 && password.value.length < passwordLength
)

const passwordsMismatch = computed(() =>
  password.value !== confirmPassword.value
)

const passwordsValid = computed(() =>
  !passwordTooShort.value && !passwordsMismatch.value
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
  if (!canSubmit.value) {
    errorMessage.value = t("profile.errorRequiredFields");
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
    setTimeout(() => {errorMessage.value = '';}, 5000);
  } finally {
    isSubmitting.value = false
  }
}

const canSubmit = computed(() =>
  fullNameError.value === "" &&
  emailError.value === "" &&
  phoneError.value === "" &&
  passwordsValid.value &&
  !isSubmitting.value
)
</script>

<style scoped>
@import '../styles/users/ProfileView.css';
</style>
