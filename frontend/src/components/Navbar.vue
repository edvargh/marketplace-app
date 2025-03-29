<template>
  <nav class="navbar">
    <div class="nav-left">
      <CustomButton>
        <router-link to="/" class ="navbar-home-link">Home</router-link>
      </CustomButton>
    </div>

    <ul class="nav-right">
      <template v-if="isAuthenticated">
        <li class="account-dropdown" ref="dropdownRef">
          <div class = "dropdown-wrapper">
          <CustomButton @click= "toggleDropdown"> Account </CustomButton>
            <ul v-if="dropdownOpen" class="dropdown-menu">
              <li><router-link to="/profile" class="dropdown-profile-link">Profile</router-link></li>
              <li><button @click.stop="handleLogout" class="dropdown-logout-button">Log Out</button></li>
            </ul>
          </div>
        </li>
      </template>
      <template v-else>
        <li>
          <CustomButton>
          <router-link to="/login" class="navbar-login-button">
            Log in
          </router-link>
        </CustomButton>
        </li>
      </template>
    </ul>
  </nav>
</template>


<script setup>
import { useUserStore } from '@/stores/userStore'
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import CustomButton from '@/components/CustomButton.vue'

const userStore = useUserStore()
const router = useRouter()

const isAuthenticated = computed(() => userStore.isAuthenticated)

const handleLogout = async () => {
  userStore.logout()
  router.push('/login')
}

const dropdownOpen = ref(false)
const dropdownRef = ref(null)

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value
}

const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    dropdownOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
@import '../styles/Navbar.css';
</style>
