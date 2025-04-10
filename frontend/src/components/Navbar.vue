<template>
  <nav class="navbar">
    <div class="nav-left">
      <CustomButton>
        <router-link to="/" class ="navbar-home-link">{{t('navbar.home')}}</router-link>
      </CustomButton>
    </div>
      <!-- Desktop Nav -->
    <ul class="nav-right" v-if="!isMobile">
      <template v-if="isAuthenticated">
        <CustomButton>
          <router-link to="/favorites" class="navbar-button">{{ t('navbar.favorites') }}</router-link>
        </CustomButton>
        <CustomButton>
          <router-link to ="/my-items" class="navbar-button">{{ t('navbar.my-items') }}</router-link>
        </CustomButton>
        <CustomButton>
          <router-link to="/create" class="navbar-button">{{ t('navbar.create-listing') }}</router-link>
        </CustomButton>
        <CustomButton>
          <router-link to="/messages/conversations" class="navbar-button">{{ t('navbar.messages') }}</router-link>
        </CustomButton>
        <CustomButton v-if="userStore.role === 'ADMIN'">
          <router-link to="/categories" class="navbar-button">{{ t('navbar.categories') }}</router-link>
        </CustomButton>
        <li class="account-dropdown" ref="dropdownRef">
          <div class = "dropdown-wrapper">
            <CustomButton @click="toggleDropdown">{{ t('navbar.account') }}</CustomButton>
            <ul v-if="dropdownOpen" class="dropdown-menu">
              <li>
                <router-link to="/profile" class="dropdown-profile-link">{{ t('navbar.profile') }}</router-link>
              </li>
              <li>
                <button @click.stop="handleLogout" class="logout-button">{{ t('navbar.logout') }}</button>
              </li>
            </ul>
          </div>
        </li>
      </template>
      <template v-else>
        <li>
          <CustomButton>
            <router-link to="/login" class="navbar-login-button">
              {{ t('navbar.login') }}
          </router-link>
        </CustomButton>
        </li>
      </template>
    </ul>
    <!-- Mobile Nav -->
    <div class="hamburger-menu" v-if="isMobile" ref="mobileMenuRef">
      <CustomButton @click="toggleMobileMenu">☰</CustomButton>
      <Teleport to="body">
      <ul v-if="showMobileMenu" class="mobile-dropdown">
        <li v-if="isAuthenticated">
        <router-link to="/favorites" class="navbar-favorites">{{ t('navbar.favorites') }}</router-link>
        </li>
        <li v-if="isAuthenticated">
          <router-link to="/my-items" @click="showMobileMenu = false">{{ t('navbar.my-items') }}</router-link>
        </li>
        <li v-if="isAuthenticated">
          <router-link to="/create" @click="showMobileMenu = false">{{ t('navbar.create-listing') }}</router-link>
        </li>
        <li v-if="isAuthenticated">
          <router-link to="/messages/conversations" @click="showMobileMenu = false">{{ t('navbar.messages') }}</router-link>
        </li>
        <li v-if="userStore.role === 'ADMIN'">
          <router-link to="/categories" @click="showMobileMenu = false">{{ t('navbar.categories') }} </router-link>
        </li>
        <li v-if="isAuthenticated">
          <router-link to="/profile" @click="showMobileMenu = false">{{ t('navbar.profile') }}</router-link>
        </li>
        <li v-if="isAuthenticated">
          <button @click="handleLogout" class="logout-button">{{ t('navbar.logout') }}</button>
        </li>
        <li v-else>
          <router-link to="/login" @click="showMobileMenu = false">{{ t('navbar.login') }}</router-link>
        </li>
      </ul>
      </Teleport>
    </div>
  </nav>
</template>


<script setup>
import { useUserStore } from '@/stores/userStore'
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import CustomButton from '@/components/CustomButton.vue'
import { useI18n } from 'vue-i18n'

const userStore = useUserStore()
const router = useRouter()
const { t } = useI18n()
const mobileMenuRef = ref(null)
const showMobileMenu = ref(false)
const isMobile = ref(false)

const isAuthenticated = computed(() => userStore.isAuthenticated)

const handleLogout = async () => {
  userStore.logout()
  await router.push('/login')
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
  if (mobileMenuRef.value && !mobileMenuRef.value.contains(event.target)) {
    showMobileMenu.value = false
  }
}

onMounted(() => {
  window.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside)
})

const checkScreenSize = () => {
  isMobile.value = window.innerWidth <= 1070
  if (!isMobile.value) showMobileMenu.value = false
}

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

onMounted(() => {
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize)
})

</script>

<style scoped>
@import '../styles/components/Navbar.css';
</style>
