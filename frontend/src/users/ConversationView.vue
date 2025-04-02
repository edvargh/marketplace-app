<template>
    <div class="conversation-container">
      <div class="participant-info">
        <img class="profile-pic" :src="otherUser.profileImage || '/default.jpg'" />
        <h2>{{ otherUser.fullName }}</h2>
      </div>
  
      <div class="item-preview">
        <img :src="item.imageUrls?.[0] || '/no-image.png'" alt="item" />
        <div class="item-details">
          <h3>{{ item.title }}</h3>
          <p>{{ item.price }} kr</p>
        </div>
      </div>
  
      <div class="messages-section">
        <div
          v-for="msg in messages"
          :key="msg.id"
          :class="['message-bubble', msg.senderId === currentUserId ? 'sent' : 'received']"
        >
          <img class="bubble-profile-pic" :src="getProfileImage(msg.senderId)" />
          <p>{{ msg.content }}</p>
        </div>
      </div>
  
      <div class="message-input-wrapper">
        <input v-model="newMessage" @keyup.enter="sendMessage" placeholder="Type your message..." />
        <button @click="sendMessage">Send</button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useRoute } from 'vue-router'
  import { useMessageStore } from '@/stores/messageStore'
  import { useUserStore } from '@/stores/userStore'
  
  const route = useRoute()
  const itemId = Number(route.query.itemId)
  const withUserId = Number(route.query.withUserId)
  const conversation= ref([])

  const messageStore = useMessageStore()
  const userStore = useUserStore()
  
  const currentUserId = userStore.user.id
  const messages = ref([])
  const item = ref({})
  const otherUser = ref({})
  const newMessage = ref('')
  
  const fetchConversation = async () => {
  try {
    const messages = await messageStore.fetchConversationWithUser(itemId, withUserId)
    console.log('[ConversationView] Fetched conversation:', messages)
    conversation.value = messages
  } catch (err) {
    console.error('[ConversationView] Failed to load conversation:', err)
  }
}
  
  const sendMessage = async () => {
    if (!newMessage.value.trim()) return
    await messageStore.sendMessage(itemId, withUserId, newMessage.value)
    newMessage.value = ''
    await fetchConversation()
  }
  
  const getProfileImage = (userId) => {
    return userId === currentUserId
      ? userStore.user.profileImage || '/default.jpg'
      : otherUser.value.profileImage || '/default.jpg'
  }
  
  onMounted(fetchConversation)
  </script>
  
<style>
@import '../styles/users/ConversationView.css';
</style>
  