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
            <h3>{{ conversation.item.title }}</h3>
          </div>
          <p class="latest-message">{{ conversation.latestMessage }}</p>
          <p class="with-user-name">With: {{ conversation.withUserName }}</p>
          <p class="price">Price: {{ conversation.item.price }} kr</p>
          <p class="status">Status: {{ conversation.item.status }}</p>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { useRouter } from 'vue-router'
  
  const props = defineProps({
    conversation: Object,
  })
  
  const router = useRouter()
  
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
  