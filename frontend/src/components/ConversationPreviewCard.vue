<template>
  <div class="conversation-preview-card" @click="goToConversation">
    <div class="conversation-card">
      <div class="card-image-container">
        <img
            :src="conversation.item.imageUrls && conversation.item.imageUrls.length > 0
              ? conversation.item.imageUrls[0]
              : '/no-image.png'"
            alt="t('ConversationPreviewCard.itemImageAlt')"
        />
      </div>

      <div class="card-content">
        <div class="card-header">
          <p class="title">{{ conversation.item.title }}</p>
          <p class="price">{{ conversation.item.price }} kr</p>
        </div>
        <p class="latest-message">
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
  import { useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import StatusBanner from "@/components/StatusBanner.vue";
  
  const props = defineProps({
    conversation: Object,
  })
  
  const router = useRouter()
  const { t } = useI18n()
  
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
  </style>
  