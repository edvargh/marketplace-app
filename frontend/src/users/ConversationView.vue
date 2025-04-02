<template>
    <div class="conversation-container">
      <!-- Participant info -->
      <div class="participant-info">
        <img
          class="profile-pic"
          :src="getProfileImage(item.value?.sellerId)"
          @error="$event.target.src = '/default-picture.jpg'"
        />
        <h2>{{ item.sellerName || 'Unknwon Seller' }}</h2>
      </div>

      <!-- Item preview -->
      <div class="item-preview">
        <img :src="item.imageUrls?.[0] || '/no-image.png'" alt="item" />
        <div class="item-details-wrapper">
        <div class="item-details"> 
            
          <h3>{{ item.title }}</h3>
          <p>{{ item.price }} kr</p>
          <p>Status: {{ item.status }}</p>
        </div>
        </div>
      </div>
  
      <!-- Messages -->
      <div class="messages-section">
        <div
          v-for="msg in messages"
          :key="msg.id"
          :class="['message-bubble', msg.senderId === currentUserId ? 'sent' : 'received']"
        >
          <img
            class="bubble-profile-pic"
            :src="getProfileImage(msg.senderId)"
            @error="$event.target.src = '/default-picture.jpg'"
          />
          <div class="bubble-text">{{ msg.content }}</div>
          <div class="sender-name">{{ getSenderName(msg.senderId) }}</div>
        </div>
      </div>
  
      <!-- Message input -->
      <div class="message-input-wrapper">
        <input
          v-model="newMessage"
          @keyup.enter="sendMessage"
          placeholder="Type your message..."
          class="message-input"
        />
        <button @click="sendMessage" class="send-button">Send</button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useRoute } from 'vue-router'
  import { useMessageStore } from '@/stores/messageStore'
  import { useUserStore } from '@/stores/userStore'
  import { useItemStore } from '@/stores/itemStore'
  
  const route = useRoute()
  const itemId = Number(route.query.itemId)
  const withUserId = Number(route.query.withUserId)
  
  const messageStore = useMessageStore()
  const itemStore = useItemStore()
  const userStore = useUserStore()
  
  const currentUserId = userStore.user.id
  const item = ref({})
  const messages = ref([])
  const newMessage = ref('')
  
  const imageBaseURL = import.meta.env.VITE_API_BASE_URL + '/uploads/'
  
  const fetchConversation = async () => {
    try {
      messages.value = await messageStore.fetchConversationWithUser(itemId, withUserId)
    } catch (err) {
      console.error('[ConversationView] Failed to load conversation:', err)
    }
  }
  
  const fetchItem = async () => {
    try {
      item.value = await itemStore.fetchItemById(itemId)
    } catch (err) {
      console.error('[ConversationView] Failed to load item:', err)
    }
  }
  
  const sendMessage = async () => {
    if (!newMessage.value.trim()) return
    await messageStore.sendMessage(itemId, withUserId, newMessage.value)
    newMessage.value = ''
    await fetchConversation()
  }
  
  const getSenderName = (senderId) => {
    return senderId === currentUserId
      ? userStore.user.fullName
      : item.value?.sellerName || 'Unknown User'
  }
  
  const getProfileImage = (userId) => {
    const defaultImage = '/default-picture.jpg'
  
    if (userId === currentUserId) {
      return userStore.user?.profileImage
        ? `${imageBaseURL}${userStore.user.profileImage}`
        : defaultImage
    }
  
    return item.value?.sellerId === userId && item.value?.sellerProfileImage
      ? `${imageBaseURL}${item.value.sellerProfileImage}`
      : defaultImage
  }
  
  onMounted(async () => {
    await Promise.all([fetchItem(), fetchConversation()])
  })
  </script>
  
  <style scoped>
  @import '../styles/users/ConversationView.css';
  </style>
  