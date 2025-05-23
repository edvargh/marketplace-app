<template>
  <LoadingState 
    :loading="loading" 
    :error="error ? error : ''"
    :loadingMessage="t('MessagesView.loadingMessage')"
  />

  <ErrorMessage v-if="!loading && error" :message="error" />

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
import { useMessageStore } from '@/stores/messageStore.js'
import { useItemStore } from '@/stores/itemStore.js'
import { useI18n } from 'vue-i18n'
import ConversationPreviewCard from '@/components/ConversationPreviewCard.vue'
import LoadingState from "@/components/LoadingState.vue"
import CardGrid from '@/components/CardGrid.vue'
import ErrorMessage from '@/components/ErrorMessage.vue' 

const messageStore = useMessageStore()
const itemStore = useItemStore()
const { t } = useI18n()

const conversations = ref([])
const loading = ref(true)
const error = ref('') 

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

  } catch (e) {
    error.value = t("MessagesView.errorLoadingMessages");
  } finally {
    loading.value = false
  }
})
</script>

<style>
@import '../../styles/views/users/MessagesView.css';
</style>
