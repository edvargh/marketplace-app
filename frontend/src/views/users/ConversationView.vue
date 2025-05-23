<template>
  <LoadingState
    :loading="isLoading"
    :error="hasError ? errorMessage : ''"
    :loadingMessage="t('ConversationView.loadingMessage')"
  />

  <div v-if="!isLoading && !hasError" class="conversation-container">
    <!-- Participant info -->
    <div class="participant-info">
      <img
        class="profile-pic"
        :src="participantProfileImage"
        @error="$event.target.src = '/default-picture.jpg'"
        alt="Participant picture"
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
          <StatusBanner :status="item.status" class="status-banner" />
        </div>
      </div>
    </RouterLink>

    <!-- Messages -->
    <div class="messages-section">
      <div v-if="messages.length === 0" class="empty-state">
        {{ t('ConversationView.noMessages') }}
      </div>
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
              alt="Profile picture"
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
                  :hideButtons="isSeller && ['ACCEPTED', 'DECLINED'].includes(msg.reservationStatus)"
                  :disabled="processingReservation"
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
    <ErrorMessage v-if="!isLoading && hasError" :message="errorMessage" />
    <div class="message-input-wrapper">
      <div class="message-input-container">
        <ReserveBox
          v-if="showReserveInput"
          class="inline-reserve-box"
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
          :placeholder="t('ConversationView.messagePlaceholder')"
          class="message-input"
        />
      </div>
      <button
        @click="sendMessage"
        :disabled="isSending"
        class="send-button"
      >
        {{ isSending ? t("ConversationView.sending") : t("ConversationView.send") }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useMessageStore } from '@/stores/messageStore.js'
import { useUserStore } from '@/stores/userStore.js'
import { useItemStore } from '@/stores/itemStore.js'
import LoadingState from "@/components/LoadingState.vue"
import ReserveBox from '@/components/ReserveBox.vue'
import StatusBanner from '@/components/StatusBanner.vue'
import ErrorMessage from '@/components/ErrorMessage.vue'
import { useI18n } from 'vue-i18n'

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
const errorMessage = ref('')
const isSending = ref(false)
const isReserveMode = ref(route.query.reserve === 'true')
const showReserveInput = ref(isReserveMode.value)
const currentUserProfileImage = ref(userStore.getCurrentUserProfileImageUrl())
const participantProfileImage = ref('/default-picture.jpg')
const otherUser = ref(null)
const processingReservation = ref(null)
const { t } = useI18n()

const isSeller = computed(() => {
  return item.value?.sellerId === currentUserId
})

const otherUserName = computed(() => {
  if (isSeller.value) {
    return otherUser.value?.fullName || 'Buyer'
  } else {
    return item.value?.sellerName || 'Seller'
  }
})

const getProfileImageForUser = (userId, isFromCurrentUser) => {
  if (isFromCurrentUser) {
    return currentUserProfileImage.value
  }
  if (userId === withUserId && participantProfileImage.value) {
    return participantProfileImage.value
  }
  return '/default-picture.jpg'
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
    hasError.value = true
    errorMessage.value = t('ConversationView.errorLoadingConversation')
  }
}

const fetchItem = async () => {
  try {
    item.value = await itemStore.fetchItemById(itemId)
    otherUser.value = await userStore.getUserById(withUserId)

    if (otherUser.value && otherUser.value.profilePicture) {
      participantProfileImage.value = otherUser.value.profilePicture
    } else if (otherUser.value && otherUser.value.profileImage) {
      participantProfileImage.value = userStore.getProfileImageUrl(otherUser.value.profileImage)
    } else {
      participantProfileImage.value = '/default-picture.jpg'
    }

    if (isSeller.value) {
      currentUserProfileImage.value = userStore.getCurrentUserProfileImageUrl()
    } else if (item.value?.sellerId) {
      try {
        const sellerData = await userStore.getUserById(item.value.sellerId)
        if (sellerData) {
          if (sellerData.profilePicture) {
            participantProfileImage.value = sellerData.profilePicture
          } else if (sellerData.profileImage) {
            participantProfileImage.value = userStore.getProfileImageUrl(sellerData.profileImage)
          }
        }
      } catch (err) {
        errorMessage.value = t('ConversationView.errorLoadingSellerData')
        hasError.value = true
      }
    }
  } catch (err) {
    hasError.value = true
    errorMessage.value = t('ConversationView.errorLoadingConversation')
  }
}

// Send message
const sendMessage = async () => {
  if ((!newMessage.value.trim() && !showReserveInput.value) || isSending.value) return

  isSending.value = true
  try {
    if (showReserveInput.value) {
      const messageText = newMessage.value.trim() || "I would like to reserve this item"
      await messageStore.sendReservationRequest(itemId, withUserId, messageText)
      showReserveInput.value = false
      newMessage.value = ''
    } else {
      await messageStore.sendMessage(itemId, withUserId, newMessage.value)
      newMessage.value = ''
    }
    await fetchConversation()
  } catch (err) {
    errorMessage.value = t('ConversationView.errorSendingMessage')
    hasError.value = true
  } finally {
    isSending.value = false
  }
}

const handleAcceptReservation = async (messageId) => {
  processingReservation.value = true
  try {
    await messageStore.updateReservationStatus(messageId, 'ACCEPTED')
    await itemStore.updateItemStatus(itemId, 'RESERVED', withUserId)
    await Promise.all([fetchConversation(), fetchItem()])
  } catch (err) {
    errorMessage.value = t('ConversationView.errorAcceptingReservation')
    hasError.value = true
  } finally {
    processingReservation.value = false
  }
}

const handleDeclineReservation = async (messageId) => {
  processingReservation.value = true
  try {
    await messageStore.updateReservationStatus(messageId, 'DECLINED')
    await fetchConversation()
  } catch (err) {
    errorMessage.value = t('ConversationView.errorDecliningReservation')
    hasError.value = true
  } finally {
    processingReservation.value = false
  }
}

const getSenderName = (senderId) => {
  if (senderId === currentUserId) {
    return userStore.user.fullName
  }
  if (otherUser.value?.fullName) {
    return otherUser.value.fullName
  }
  return item.value?.sellerName || t('ConversationView.unknownUser')
}

watch(messages, async () => {
  await nextTick()
  const container = document.querySelector('.messages-section')
  container?.scrollTo({ top: container.scrollHeight, behavior: 'smooth' })
})

onMounted(async () => {
  isLoading.value = true
  hasError.value = false
  errorMessage.value = ''

  try {
    await fetchItem()
    await fetchConversation()
  } catch (err) {
    hasError.value = true
    errorMessage.value = t('ConversationView.errorLoadingConversation')
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
@import '../../styles/views/users/ConversationView.css';
</style>
