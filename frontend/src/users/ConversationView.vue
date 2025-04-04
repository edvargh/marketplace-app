<template>
  <LoadingState :loading="isLoading" :error="hasError" loadingMessage="Loading conversation..."/>

  <div v-if="!isLoading && !hasError" class="conversation-container">
    <!-- Participant info -->
    <div class="participant-info">
      <img
        class="profile-pic"
        :src="getProfileImage(item.value?.sellerId)"
        @error="$event.target.src = '/default-picture.jpg'"
      />
      <h2>{{ item.sellerName || 'Unknown Seller' }}</h2>
  	</div>

    <!-- Item preview -->
    <RouterLink
      :to="`/item/${itemId}`"
      class="item-preview"
      style="text-decoration: none; color: inherit;"
    >
      <img :src="item.imageUrls?.[0] || '/no-image.png'" alt="item" />
      <div class="item-details-wrapper">
        <div class="item-details">
          <h3>{{ item.title }}</h3>
          <p>{{ item.price }} kr</p>
          <p>Status: {{ item.status }}</p>
        </div>
      </div>
    </RouterLink>

    <!-- Messages -->
    <div class="messages-section">
      <div v-if="messages.length === 0" class="empty-state">No messages here yet</div>
      <div v-else>
        <div v-for="msg in messages" :key="msg.id">
          <div v-if="msg.isDateDivider" class="date-divider">
            {{ msg.date }}
          </div>
          <div v-else :class="['message-bubble', msg.fromYou ? 'sent' : 'received']">
            <img
              class="bubble-profile-pic"
              :src="getProfileImage(msg.senderId)"
              @error="$event.target.src = '/default-picture.jpg'"
            />
            <div class="bubble-content">
              <div class="bubble-time">
                {{ new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
              </div>
              <div class="bubble-text">{{ msg.content }}</div>
              <div class="sender-name">{{ getSenderName(msg.senderId) }}</div>
            </div>
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
      <button @click="sendMessage" :disabled="isSending" class="send-button">
        {{ isSending ? 'Sending...' : 'Send' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useMessageStore } from '@/stores/messageStore'
import { useUserStore } from '@/stores/userStore'
import { useItemStore } from '@/stores/itemStore'
import LoadingState from "@/components/LoadingState.vue";

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
const isLoading = ref(true)
const hasError = ref(false)
const isSending = ref(false)

const imageBaseURL = import.meta.env.VITE_API_BASE_URL + '/uploads/'

const fetchConversation = async () => {
  try {
    const rawMessages = await messageStore.fetchConversationWithUser(itemId, withUserId)

    const normalized = rawMessages.map(msg => ({
      id: msg.id,
      fromYou: msg.fromYou,
      senderId: msg.fromYou ? currentUserId : item.value?.sellerId,
      content: msg.text,
      sentAt: msg.sentAt
    }))

    const grouped = []
    let lastDate = ''

    for (const msg of normalized) {
      const currentDate = new Date(msg.sentAt).toLocaleDateString()
      if (currentDate !== lastDate) {
        grouped.push({ isDateDivider: true, date: currentDate })
        lastDate = currentDate
      }
      grouped.push(msg)
    }

    messages.value = grouped
  } catch (err) {
    hasError.value = true
  }
}

// Fetch item info
const fetchItem = async () => {
  try {
    item.value = await itemStore.fetchItemById(itemId)
  } catch (err) {
    hasError.value = true
  }
}

// Send message
const sendMessage = async () => {
  if (!newMessage.value.trim() || isSending.value) return

  isSending.value = true
  try {
    await messageStore.sendMessage(itemId, withUserId, newMessage.value)
    newMessage.value = ''
    await fetchConversation()
  } finally {
    setTimeout(() => {
      isSending.value = false
    }, 500)
  }
}

// Get sender name
const getSenderName = (senderId) => {
  return senderId === currentUserId
    ? userStore.user.fullName
    : item.value?.sellerName || 'Unknown User'
}

// Get profile image
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

// Auto scroll to bottom when messages update
watch(messages, async () => {
  await nextTick()
  const container = document.querySelector('.messages-section')
  container?.scrollTo({ top: container.scrollHeight, behavior: 'smooth' })
})

onMounted(async () => {
  isLoading.value = true
  hasError.value = false

  try {
    await Promise.all([fetchItem(), fetchConversation()])
  } catch (err) {
    hasError.value = true
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
@import '../styles/users/ConversationView.css';
</style>
