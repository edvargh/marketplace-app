<template>
  <nav class="navbar">
    <router-link to="/" >Home</router-link>

      <ul>
        <template v-if="isAuthenticated">
          <li><button @click="handleLogout" class="logout-button">Log Out</button></li>
          <li><router-link to="/profile">Profile</router-link></li>
        </template>

        <template v-else>
          <li><router-link to="/login">login</router-link></li>
        </template>
      </ul>
    </nav>
</template>


<script setup>
import { useUserStore } from '@/stores/userStore'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()

const isAuthenticated = computed(() => userStore.isAuthenticated)

const handleLogout = async () => {
  await userStore.logout()
  await router.push('/login')
}
</script>

<style scoped>
@import '../styles/Navbar.css';
</style>
