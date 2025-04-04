<template>
  <div class="conversation-preview-card" @click="goToConversation">
    <div class="conversation-card">
      <div class="card-image-container">
        <img
            :src="conversation.item.imageUrls && conversation.item.imageUrls.length > 0
              ? conversation.item.imageUrls[0]
              : '/no-image.png'"
            alt="Item image"
        />
      </div>

      <div class="card-content">
        <div class="card-header">
          <p class="title">{{ conversation.item.title }}</p>
          <p class="price">{{ conversation.item.price }} kr</p>
        </div>
        <p class="latest-message">
            <span class="sender-indicator">
              {{ lastMessageSenderIndicator }}:
            </span>
          {{ conversation.latestMessage }}
        </p>
        <div class="status-banner-container">
          <StatusBanner :status="conversation.item.status" />
        </div>
      </div>
    </div>
  </div>
</template>
  
  <script setup>
  import { computed } from "vue";
  import { useRouter } from 'vue-router'
  import StatusBanner from "@/components/StatusBanner.vue";
  
  const props = defineProps({
    conversation: Object,
  })
  
  const router = useRouter()

  const lastMessageSenderIndicator = computed(() => {
    return props.conversation.lastMessageFromYou ? 'You' : props.conversation.withUserName
  })
  
  const goToConversation = () => {
    router.push({
      name: 'ConversationView',
      query: {
        itemId: props.conversation.item.id,
        withUserId: props.conversation.withUserId
      }
    })
  }
  </script>
  
  <style scoped>
  @import '../styles/components/ConversationPreviewCard.css';
  
  .card-image-container img {
    max-width: 100px;
    max-height: 100px;
    object-fit: cover;
    border-radius: 8px;
  }
  </style>
  