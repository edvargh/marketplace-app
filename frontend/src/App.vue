<script setup>
import { RouterView, useRoute } from 'vue-router'
import { onMounted } from 'vue'
import Navbar from './components/Navbar.vue'
import { useUserStore } from './stores/userStore'
import { useI18nStore } from './stores/languageStore'

const userStore = useUserStore()
const i18nStore = useI18nStore()
const route = useRoute()

onMounted(async () => {
  const userData = await userStore.checkAuth()
  
  if (userData?.preferredLanguage) {
    i18nStore.syncWithUserPreferences(userData.preferredLanguage)
  }
})
</script>

<template>
  <div>
    <Navbar v-if="!route.meta.hideNavbar" />
    <RouterView />
  </div>
</template>