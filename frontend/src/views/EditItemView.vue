<template>
  <div v-if="loading" class="loading">
    Loading item data...
  </div>
  <div v-else-if="error" class="error">
    {{ error }}
  </div>

  <Notification
      v-if="showSaveSuccess"
      type="success"
      message="Advertisement updated successfully!"
      :autoClose="true"
      @close="showSaveSuccess = false"
  />
  <Notification
      v-if="showDeleteSuccess"
      type="success"
      message="Advertisement deleted successfully!"
      :autoClose="true"
      @close="showDeleteSuccess = false"
  />

  <div class="edit-item-view">
    <ItemForm
        title="Edit Advertisement"
        @submit="handleSubmit"
        :initial-data="formData"
        :showStatus="true"
    >
      <template #actions="{ isValid }">
        <button
            type="button"
            class="action-button button-danger"
            @click="handleDelete"
            :disabled="isSubmitting"
        >
          {{ isDeleting ? 'Deleting...' : 'Delete' }}
        </button>
        <button
            type="submit"
            class="action-button button-primary"
            :disabled="isSubmitting || !isValid"
        >
          {{ isSubmitting ? 'Saving...' : 'Save' }}
        </button>
      </template>
    </ItemForm>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ItemForm from '@/components/ItemForm.vue';
import Notification from '@/components/NotificationBanner.vue';
import { useItemStore } from '@/stores/itemStore';
import { useUserStore } from '@/stores/userStore';

const route = useRoute();
const router = useRouter();
const itemStore = useItemStore();
const userStore = useUserStore();
const isSubmitting = ref(false);
const isDeleting = ref(false);
const loading = ref(true);
const error = ref(null);
const showSaveSuccess = ref(false);
const showDeleteSuccess = ref(false);

defineProps({
  id: String
});

const formData = reactive({
  title: '',
  description: '',
  price: 0,
  categoryId: null,
  status: '',
  latitude: null,
  longitude: null,
  images: [],
  currentImageIndex: 0
});

onMounted(async () => {
  try {
    loading.value = true;

    const itemId = route.params.id;
    if (!itemId) {
      throw new Error('No item ID provided');
    }

    const item = await itemStore.fetchItemById(itemId);
    if (!item) {
      throw new Error('Item not found');
    }

    if (userStore.user?.id !== item.sellerId) {
      throw new Error('You do not have permission to edit this item');
    }

    Object.assign(formData, {
      title: item.title,
      description: item.description,
      price: item.price,
      categoryId: item.categoryId,
      status: item.status || 'FOR_SALE',
      latitude: item.latitude,
      longitude: item.longitude,
      images: item.imageUrls ? item.imageUrls.map(url => ({
        url,
        file: null,
        id: url,
        isExisting: true
      })) : []
    });

  } catch (error) {
    console.error('Failed to fetch item:', error);
    error.value = error.message || 'Failed to load item details';
  } finally {
    loading.value = false;
  }
});

const handleSubmit = async (updatedFormData) => {
  try {
    isSubmitting.value = true;

    const processedImages = await Promise.all(
        updatedFormData.images
            .map(async (img) => {
              if (img.isExisting && !img.file) {
                const response = await fetch(img.url);
                const blob = await response.blob();
                return {...img, file: new File([blob], `image_${Date.now()}.jpg`, { type: blob.type })
                };
              }
              return img;
            })
    );

    const processedData = {
      ...updatedFormData,
      images: processedImages
    };

    await itemStore.updateItem(route.params.id, processedData);
    showSaveSuccess.value = true;
    setTimeout(() => {
      router.push({ name: 'ItemView', params: { id: route.params.id } });}, 2000);

  } catch (error) {
    console.error('Failed to update item:', error);
  } finally {
    isSubmitting.value = false;
  }
};

const handleDelete = async () => {
  // TODO: Custom styling/component for confirmation banner?
  if (!confirm('Are you sure you want to delete this item?')) return;

  try {
    isDeleting.value = true;
    const success = await itemStore.deleteItem(route.params.id);
    if (success) {
      showDeleteSuccess.value = true;
      setTimeout(() => {
        router.push({ name: 'my-items' });}, 2000);
    }
  } catch (error) {
    console.error('Failed to delete item:', error);
  } finally {
    isDeleting.value = false;
  }
};
</script>

<style scoped>
@import '../styles/components/ItemFormButton.css';
</style>