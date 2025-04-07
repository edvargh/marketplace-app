<template>
  <LoadingState :loading="loadingInitial" :error="error" :loadingMessage="t('myItemsView.Loading-my-items')" />

  <div v-if="!loadingInitial && !error" class="my-items-container">
    <h2 class="my-items-title">{{ t('myItemsView.title') }}</h2>

    <div v-if="myItems.length > 0" class="my-items-grid">
      <CardGrid
        :items="myItems"
        :cardComponent="CompactItemCard"
        variant="compact"
      />
    </div>

    <div v-if="moreAvailable" class="load-more-wrapper">
      <button @click="loadMore" type="button" class="action-button button-cancel" :disabled="loadingMore">
        {{ loadingMore ? t('myItemsView.loadingMore') : t('myItemsView.loadMore') }}
      </button>
    </div>

    <div v-else-if="myItems.length === 0" class="no-items-message">
      {{ t('myItemsView.noItems') }}
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useItemStore } from '@/stores/itemStore'
import { usePaginatedLoader } from '@/usePaginatedLoader.js'
import CompactItemCard from '@/components/CompactItemCard.vue'
import LoadingState from "@/components/LoadingState.vue";
import CardGrid from '@/components/CardGrid.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const itemStore = useItemStore()

const {
  items: myItems,
  loadingInitial,
  loadingMore,
  loadMore,
  moreAvailable,
  error
} = usePaginatedLoader(itemStore.fetchUserItems)

onMounted(async () => {
  try {
    await loadMore()
  } catch (err) {
    error.value = "myItemsView.loadingError"
  }
})
</script>

<style>
@import '../styles/users/MyItemsView.css';
@import '../styles/components/ItemFormButton.css';
</style>
  