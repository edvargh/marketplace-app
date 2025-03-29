<script setup>
import { RouterLink, RouterView, useRoute } from 'vue-router'
import Navbar from './components/Navbar.vue'
import { useUserStore } from './stores/userStore'

const userStore = useUserStore()
const route = useRoute()
userStore.checkAuth()
</script>

<template>
  <div>
    <Navbar v-if="!route.meta.hideNavbar" />
    <RouterView />
  </div>
</template>

