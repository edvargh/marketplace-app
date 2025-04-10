<template>
  <ErrorMessage v-if="errorMessage" :message="errorMessage" />

  <div class="create-item-view">
    <Notification
        v-if="showCreateSuccess"
        type="success"
        :message="t('createItemView.successMessage')"
        :autoClose="false"
        :showClose="false"
        @close="showCreateSuccess = false"
    />

    <ItemForm
        :title="t('createItemView.title')"
        @submit="handleSubmit"
        :showStatus="false"
        :initialData="{
          title: '',
          description: '',
          price: '',
          categoryId: null,
          status: 'FOR_SALE',
          images: [],
          currentImageIndex: 0
        }"
    >
      <template #actions="{ isValid }">
        <button
            type="submit"
            class="action-button button-primary"
            :disabled="isSubmitting || !isValid"
        >
          {{ isSubmitting ? t('createItemView.creating') : t('createItemView.create') }}
        </button>
      </template>
    </ItemForm>
  </div>
</template>


<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import ItemForm from '@/components/ItemForm.vue';
import { useItemStore } from '@/stores/itemStore.js';
import { useI18n } from 'vue-i18n';
import Notification from "@/components/NotificationBanner.vue";
import ErrorMessage from '@/components/ErrorMessage.vue'

const router = useRouter();
const isSubmitting = ref(false);
const showCreateSuccess = ref(false);
const errorMessage = ref('');
const itemStore = useItemStore();
const { t } = useI18n();

const handleSubmit = async (formData) => {
  try {
    isSubmitting.value = true;
    errorMessage.value = '';

    const createdItem = await itemStore.createItem(formData);
    showCreateSuccess.value = true;
    setTimeout(() => {
      router.push({ name: 'ItemView', params: { id: createdItem.id } });}, 2000);

  } catch (error) {
    errorMessage.value = t('createItemView.errorCreate');
    setTimeout(() => errorMessage.value = '', 5000);
  } finally {
    isSubmitting.value = false;
  }
};

</script>

<style scoped>
</style>


