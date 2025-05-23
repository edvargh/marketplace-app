<template>
  <LoadingState
    :loading="loading"
    :error="error"
    :loadingMessage="t('EditItemView.loadingMessage')"
  />

  <ErrorMessage v-if="!loading && errorMessage" :message="errorMessage" />

  <div v-if="!loading && !error" class="edit-item-view">
    <Notification
      v-if="showSaveSuccess"
      type="success"
      :message="t('EditItemView.successUpdate')"
      :autoClose="false"
      :showClose="false"
      @close="showSaveSuccess = false"
    />
    <Notification
      v-if="showDeleteSuccess"
      type="success"
      :message="t('EditItemView.successDelete')"
      :autoClose="false"
      :showClose="false"
      @close="showDeleteSuccess = false"
    />

    <ItemForm
      :title="t('EditItemView.title')"
      @submit="handleSubmit"
      :initial-data="formData"
      :showStatus="true"
    >
      <template #actions="{ isValid }">
        <button
          type="submit"
          class="action-button button-primary"
          :disabled="isSubmitting || isDeleting || !isValid"
        >
          {{ isSubmitting ? t('EditItemView.saving') : t('EditItemView.save') }}
        </button>
        <button
          type="button"
          class="action-button button-danger"
          @click="handleDelete"
          :disabled="isSubmitting || isDeleting"
        >
          {{ isDeleting ? t('EditItemView.deleting') : t('EditItemView.delete') }}
        </button>
      </template>
    </ItemForm>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ItemForm from '@/components/ItemForm.vue'
import Notification from '@/components/NotificationBanner.vue'
import { useItemStore } from '@/stores/itemStore.js'
import LoadingState from '@/components/LoadingState.vue'
import ErrorMessage from '@/components/ErrorMessage.vue'
import { useI18n } from 'vue-i18n'

const route = useRoute()
const router = useRouter()
const itemStore = useItemStore()
const isSubmitting = ref(false)
const isDeleting = ref(false)
const loading = ref(true)
const error = ref(null)
const showSaveSuccess = ref(false)
const showDeleteSuccess = ref(false)
const errorMessage = ref('')
const { t } = useI18n()

defineProps({
  id: String,
})

const formData = reactive({
  title: '',
  description: '',
  price: 0,
  categoryId: null,
  status: '',
  latitude: null,
  longitude: null,
  images: [],
  currentImageIndex: 0,
})

onMounted(async () => {
  loading.value = true
  try {
    const itemId = route.params.id
    const item = await itemStore.fetchItemById(itemId)

    Object.assign(formData, {
      title: item.title,
      description: item.description,
      price: item.price,
      categoryId: item.categoryId,
      status: item.status || 'FOR_SALE',
      latitude: item.latitude,
      longitude: item.longitude,
      images: item.imageUrls
        ? item.imageUrls.map((url) => ({
            url,
            file: null,
            id: url,
            isExisting: true,
          }))
        : [],
    })
  } catch (e) {
    error.value = t('EditItemView.errorLoad')
  } finally {
    loading.value = false
  }
})

const handleSubmit = async (updatedFormData) => {
  try {
    isSubmitting.value = true

    const processedImages = await Promise.all(
      updatedFormData.images.map(async (img) => {
        if (img.isExisting && !img.file) {
          const response = await fetch(img.url)
          const blob = await response.blob()
          return { ...img, file: new File([blob], `image_${Date.now()}.jpg`, { type: blob.type }) }
        }
        return img
      }),
    )

    const processedData = {
      ...updatedFormData,
      images: processedImages,
    }

    await itemStore.updateItem(route.params.id, processedData)
    showSaveSuccess.value = true
    setTimeout(() => {
      router.push({ name: 'ItemView', params: { id: route.params.id } })
    }, 2000)
  } catch (error) {
    errorMessage.value = t('EditItemView.errorUpdate')
    setTimeout(() => (errorMessage.value = ''), 5000)
  } finally {
    isSubmitting.value = false
  }
}

const handleDelete = async () => {
  if (!confirm(t('EditItemView.confirmDelete'))) return

  try {
    isDeleting.value = true
    const success = await itemStore.deleteItem(route.params.id)
    if (success) {
      showDeleteSuccess.value = true
      setTimeout(() => {
        router.push({ name: 'my-items' })
      }, 2000)
    }
  } catch (error) {
    errorMessage.value = t('EditItemView.errorDelete')
    setTimeout(() => (errorMessage.value = ''), 5000)
  } finally {
    isDeleting.value = false
  }
}
</script>

<style scoped></style>
