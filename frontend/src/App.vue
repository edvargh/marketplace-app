<script setup>
import { RouterLink, RouterView } from 'vue-router'
import Navbar from './components/Navbar.vue'
import { useUserStore } from './stores/userStore'

const userStore = useUserStore()
userStore.checkAuth()
</script>

<template>
  <Navbar />

  <RouterView />
</template>

