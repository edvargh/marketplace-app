<template>
    <div class="messages-view-container">
      <h3>Messages</h3>
      <div class="messages-container">
        <ConversationPreviewCard
          v-for="conv in conversations"
          :key="conv.withUserId + '-' + conv.itemId"
          :conversation="conv"
        />
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useMessageStore } from '@/stores/messageStore'
  import ConversationPreviewCard from '@/components/ConversationPreviewCard.vue'
  
  const messageStore = useMessageStore()
  const conversations = ref([])
  
  onMounted(async () => {
    try {
      console.log('[MessagesView] Fetching user conversations...')
      const rawData = await messageStore.fetchUserConversations()
      console.log('[MessagesView] Raw conversation data:', rawData)
  
      conversations.value = rawData.map(c => ({
        item: {
          id: c.itemId,
          title: c.itemTitle,
          price: 'N/A', // Placeholder
          status: 'Active', // Placeholder
          imageUrls: ['/no-image.png'] // Placeholder
        },
        latestMessage: c.lastMessage,
        withUserId: c.withUserId,
        withUserName: c.withUserName
      }))
      console.log('[MessagesView] Mapped conversations:', conversations.value)
    } catch (err) {
      console.error('[MessagesView] Error loading conversations:', err)
    }
  })
  </script>
  
  <style scoped>
  .messages-view-container {
    padding: 2rem;
    max-width: 800px;
    margin: 0 auto;
  }
  .messages-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  </style>
  