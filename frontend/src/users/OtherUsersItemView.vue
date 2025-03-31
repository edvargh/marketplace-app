<template>
    <div class="item-profile">
      <h1 class="user-fullName ">{{ userStore.user?.fullName || 'Unnamed User' }}</h1>
      <div class="profile-picture-wrapper">
        <img :src="profileImage" alt="Profile Picture" class="profile-picture" />
      </div>
      <h1 class="other-user-current-market ">{{ userStore.user?.fullName || 'Unnamed User' }}'s current items on the market</h1> 
</div>
  </template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useUserStore} from '@/stores/userStore'

const userStore = useUserStore()
const profileImage = ref('/default-picture.jpg')

const fullName = computed(() => userStore.user?.fullName || 'Anonymous')

onMounted(() => {
  if (userStore.user?.profileImageUrl) {
    profileImage.value = userStore.user.profileImageUrl
  }
})
</script>


<style scoped>
@import '@/styles/OtherUsersItemView.css';
</style>