<template>
  <LoadingState :loading="loading" :error="error" :loadingMessage="t('MessagesView.loadingMessage')"/>

  <div v-if="!loading && !error" class="messages-view-container">
    <h3 class="Message-header">{{ t("MessagesView.title") }}</h3>
      <CardGrid
        v-if="conversations.length > 0"
        :items="conversations"
        :cardComponent="ConversationPreviewCard"
        variant="messages"
        propName="conversation"
      />
      <div v-else class="no-messages">
        {{ t("MessagesView.noMessages") }}
      </div>
  </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useMessageStore } from '@/stores/messageStore'
  import { useItemStore } from '@/stores/itemStore'
  import { useI18n } from 'vue-i18n'
  import ConversationPreviewCard from '@/components/ConversationPreviewCard.vue'
  import LoadingState from "@/components/LoadingState.vue";
  import CardGrid from '@/components/CardGrid.vue'
  
  const messageStore = useMessageStore()
  const itemStore = useItemStore()
  const { t } = useI18n()
  const conversations = ref([])
  const loading = ref(true)
  const error = ref(false)
  
  onMounted(async () => {
    try {
      const rawData = await messageStore.fetchUserConversations()
  
      const enriched = await Promise.all(
        rawData.map(async (c) => {
          try {
            const item = await itemStore.fetchItemById(c.itemId)
  
            return {
              item,
              latestMessage: c.lastMessage,
              withUserId: c.withUserId,
              withUserName: c.withUserName
            }
          } catch {
            return null
          }
        })
      )
  
      conversations.value = enriched.filter(c => c !== null)
    } catch {
      error.value = true
    } finally {
      loading.value = false
    }
  })
  </script>
  
  <style scoped>
  @import '../styles/users/MessagesView.css';
  </style>