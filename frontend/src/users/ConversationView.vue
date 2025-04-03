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
        >
        <div v-if = "msg.isDateDivider" class = "date-divider">
            {{ msg.date }}
        </div>
        <div
        v-else
        :class="['message-bubble', msg.senderId === currentUserId ? 'sent' : 'received']" 
        >
          <img
            class="bubble-profile-pic"
            :src="getProfileImage(msg.senderId)"
            @error="$event.target.src = '/default-picture.jpg'"
          />
          <div class = "bubble-content">
            <div class="bubble-time">
                {{ new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
            </div>
          <div class="bubble-text">{{ msg.content }}</div>
          <div class="sender-name">{{ getSenderName(msg.senderId) }}</div>
        </div>
        </div> 
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


// 🔍 Fetch messages
const fetchConversation = async () => {
  try {
    const rawMessages = await messageStore.fetchConversationWithUser(itemId, withUserId)
    console.log('[ConversationView] ✅ Raw messages from backend:', rawMessages)

    const normalized = rawMessages.map(msg => ({
      id: msg.id,
      senderId: msg.fromYou ? currentUserId : item.value?.sellerId,
      content: msg.text,
      sentAt: msg.sentAt
    }))

    const grouped = []
    let lastDate = ''

    for (const msg of normalized){
        const currentDate = new Date(msg.sentAt).toLocaleDateString()

        if (currentDate !== lastDate) {
            grouped.push({
            isDateDivider: true,
            date: currentDate

        })
        lastDate= currentDate
        }
        grouped.push(msg)
    }

    messages.value = grouped
    } catch(err) {
    console.error('[ConversationView] ❌ Failed to load messages:', err)
    }
    }


// 🔍 Fetch item info
const fetchItem = async () => {
  try {
    item.value = await itemStore.fetchItemById(itemId)
    console.log('[ConversationView] 🛒 Item fetched:', item.value)
  } catch (err) {
    console.error('[ConversationView] ❌ Failed to load item:', err)
  }
}

// 🔍 Send message
const sendMessage = async () => {
  if (!newMessage.value.trim()) return

  console.log('[ConversationView] 📤 Sending message:', {
    itemId,
    receiverId: withUserId,
    messageText: newMessage.value
  })

  await messageStore.sendMessage(itemId, withUserId, newMessage.value)
  newMessage.value = ''
  await fetchConversation()
}

// 🧠 Get sender name for bubble
const getSenderName = (senderId) => {
  return senderId === currentUserId
    ? userStore.user.fullName
    : item.value?.sellerName || 'Unknown User'
}

// 🖼️ Get profile image
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

// 🚀 Init
onMounted(async () => {
  console.log('[ConversationView] 🔄 Mounting component with:', {
    itemId,
    withUserId,
    currentUserId
  })

  await Promise.all([fetchItem(), fetchConversation()])
  console.log('[ConversationView] ✅ Component mounted. Current messages:', messages.value)
})
</script>

  <style scoped>
  @import '../styles/users/ConversationView.css';
  </style>
  