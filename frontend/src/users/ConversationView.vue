<template>
  <LoadingState :loading="isLoading" :error="hasError" loadingMessage="Loading conversation..."/>

  <div v-if="!isLoading && !hasError" class="conversation-container">
    <!-- Participant info -->
    <div class="participant-info">
      <img
        class="profile-pic"
        :src="participantProfileImage"
        @error="$event.target.src = '/default-picture.jpg'"
      />
      <h2>{{ otherUserName }}</h2>
    </div>

    <!-- Item preview -->
    <RouterLink
      :to="`/item/${itemId}`"
      class="item-preview"
      style="text-decoration: none; color: inherit;"
    >
      <img :src="item.imageUrls?.[0] || '/no-image.png'" alt="item" />
      <div class="item-details-wrapper">
        <h3 class="item-title">{{ item.title }}</h3>
        <div class="price-status-wrapper">
          <p class="price">{{ item.price }} kr</p>
          <StatusBanner :status="item.status" class="status-banner"></StatusBanner>
        </div>
      </div>
    </RouterLink>

    <!-- Messages -->
    <div class="messages-section">
      <div v-if="messages.length === 0" class="empty-state">No messages here yet</div>
      <template v-else>
        <div v-for="msg in messages" :key="msg.id">
          <div v-if="msg.isDateDivider" class="date-divider">
            {{ msg.date }}
          </div>
          <div v-else :class="['message-bubble', msg.fromYou ? 'sent' : 'received']">
            <img
              class="bubble-profile-pic"
              :src="getProfileImageForUser(msg.senderId, msg.fromYou)"
              @error="$event.target.src = '/default-picture.jpg'"
            />
            <div class="bubble-content">
              <div class="bubble-time">
                {{ new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
              </div>

              <!-- Display regular message or ReserveBox with message -->
              <div v-if="msg.isReservationRequest">
                <ReserveBox
                  :itemId="itemId"
                  :buyerId="msg.fromYou ? currentUserId : withUserId"
                  :buyerName="msg.fromYou ? userStore.user.fullName : otherUserName"
                  :isSellerView="!msg.fromYou && isSeller"
                  :initialStatus="msg.reservationStatus"
                  :reservationMessage="msg.content"
                  @accept="handleAcceptReservation(msg.messageId)"
                  @decline="handleDeclineReservation(msg.messageId)"
                />
              </div>

              <div class="bubble-text">{{ msg.content }}</div>
              <div class="sender-name">{{ getSenderName(msg.senderId) }}</div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <div class="message-input-wrapper">
      <div class="message-input-container">
        <!-- Display ReserveBox if the user clicked from ReserveButton in ItemView -->
        <ReserveBox
          v-if="showReserveInput"
          :itemId="itemId"
          :buyerId="currentUserId"
          :buyerName="userStore.user.fullName"
          :isSellerView="false"
          :initialStatus="'PENDING'"
          :showCancel="true"
          @cancel="showReserveInput = false"
        />

        <input
          v-model="newMessage"
          @keyup.enter="sendMessage"
          placeholder="Type your message..."
          class="message-input"
        />
      </div>

      <button
        @click="sendMessage"
        :disabled="isSending"
        class="send-button"
      >
        {{ isSending ? 'Sending...' : 'Send' }}
      </button>
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted, watch, nextTick, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useMessageStore } from '@/stores/messageStore'
import { useUserStore } from '@/stores/userStore'
import { useItemStore } from '@/stores/itemStore'
import LoadingState from "@/components/LoadingState.vue";
import ReserveBox from '@/components/ReserveBox.vue'
import StatusBanner from '@/components/StatusBanner.vue'

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
const isReserveMode = ref(route.query.reserve === 'true')
const showReserveInput = ref(isReserveMode.value)

// Use consistent URLs from the store
const currentUserProfileImage = ref(userStore.getCurrentUserProfileImageUrl())
const participantProfileImage = ref('/default-picture.jpg')
const otherUser = ref(null)

// Determine if current user is the seller of this item
const isSeller = computed(() => {
  return item.value?.sellerId === currentUserId
})

// The name of the other participant in the conversation
const otherUserName = computed(() => {
  if (isSeller.value) {
    return otherUser.value?.fullName || 'Buyer'
  } else {
    return item.value?.sellerName || 'Seller'
  }
})

// Get profile image for a specific user ID - improved version
const getProfileImageForUser = (userId, isFromCurrentUser) => {
  if (isFromCurrentUser) {
    return currentUserProfileImage.value;
  }
  
  // For the other user, use their ID to ensure we get the right image
  if (userId === withUserId && participantProfileImage.value) {
    return participantProfileImage.value;
  }
  
  return '/default-picture.jpg';
}

const fetchConversation = async () => {
  try {
    const rawMessages = await messageStore.fetchConversationWithUser(itemId, withUserId)
    const normalized = rawMessages.map(msg => ({
      messageId: msg.messageId,
      fromYou: msg.fromYou,
      senderId: msg.fromYou ? currentUserId : withUserId,
      content: msg.text,
      sentAt: msg.sentAt,
      isReservationRequest: msg.reservationStatus,
      reservationStatus: msg.reservationStatus || 'PENDING'
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
    console.error('Error fetching conversation:', err)
    hasError.value = true
  }
}

// Fetch item info
const fetchItem = async () => {
  try {
    item.value = await itemStore.fetchItemById(itemId)
    console.log('Fetched item:', item.value)
    
    // Fetch the other user's details
    otherUser.value = await userStore.getUserById(withUserId)
    console.log('Fetched other user:', otherUser.value)
    
    // Set participant profile image with improved handling
    if (otherUser.value && otherUser.value.profilePicture) {
      // Use the profilePicture field directly if it exists
      participantProfileImage.value = otherUser.value.profilePicture;
    } else if (otherUser.value && otherUser.value.profileImage) {
      // Fall back to the store method if needed
      participantProfileImage.value = userStore.getProfileImageUrl(otherUser.value.profileImage);
    } else {
      participantProfileImage.value = '/default-picture.jpg';
    }
    console.log('Set participant profile image:', participantProfileImage.value)
    
    // Ensure current user profile image is correct based on seller/buyer context
    if (isSeller.value) {
      currentUserProfileImage.value = userStore.getCurrentUserProfileImageUrl();
    } else if (item.value?.sellerId) {
      // We're the buyer, seller image is the participant
      try {
        const sellerData = await userStore.getUserById(item.value.sellerId)
        if (sellerData) {
          if (sellerData.profilePicture) {
            participantProfileImage.value = sellerData.profilePicture;
          } else if (sellerData.profileImage) {
            participantProfileImage.value = userStore.getProfileImageUrl(sellerData.profileImage);
          }
          console.log('Set seller profile image:', participantProfileImage.value)
        }
      } catch (err) {
        console.error('Error fetching seller data:', err)
      }
    }

  } catch (err) {
    console.error('Error fetching item:', err)
    hasError.value = true
  }
}

// Send message
const sendMessage = async () => {
  if ((!newMessage.value.trim() && !showReserveInput.value) || isSending.value) return

  isSending.value = true
  try {
    if (showReserveInput.value) {
      const messageText = newMessage.value.trim() || "I would like to reserve this item"
      const result = await messageStore.sendReservationRequest(
        itemId,
        withUserId,
        messageText
      )
      console.log('Reservation request sent:', result)
      showReserveInput.value = false 
      newMessage.value = '' 
    } else {
      await messageStore.sendMessage(itemId, withUserId, newMessage.value)
      newMessage.value = ''
    }
    await fetchConversation()
  } catch (err) {
    console.error('Error sending message:', err)
  } finally {
    isSending.value = false
  }
}

// Accept reservation
const handleAcceptReservation = async (messageId) => {
  try {
    await messageStore.updateReservationStatus(messageId, 'ACCEPTED');
    await itemStore.updateItemStatus(itemId, 'RESERVED');
    await Promise.all([fetchConversation(), fetchItem()]);

  } catch (err) {
    console.error('Error accepting reservation:', err);
  }
}

const handleDeclineReservation = async (messageId) => {
  try {
    await messageStore.updateReservationStatus(messageId, 'DECLINED')
    await fetchConversation()
  } catch (err) {
    console.error('Error declining reservation:', err)
  }
}

// Get sender name
const getSenderName = (senderId) => {
  if (senderId === currentUserId) {
    return userStore.user.fullName
  }
  
  if (otherUser.value?.fullName) {
    return otherUser.value.fullName
  }
  
  return item.value?.sellerName || 'Unknown User'
}

watch(messages, async () => {
  await nextTick()
  const container = document.querySelector('.messages-section')
  container?.scrollTo({ top: container.scrollHeight, behavior: 'smooth' })
})

onMounted(async () => {
  isLoading.value = true
  hasError.value = false

  try {
    await fetchItem()
    await fetchConversation()
    
  } catch (err) {
    console.error('Error in component mounting:', err)
    hasError.value = true
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
@import '../styles/users/ConversationView.css';
</style>