<template>
  <div class="create-item-view">
    <ItemForm
        title="Create New Advertisement"
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
          {{ isSubmitting ? 'Creating...' : 'Create' }}
        </button>
      </template>
    </ItemForm>
  </div>
</template>


<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import ItemForm from '@/components/ItemForm.vue';
import { useItemStore } from '@/stores/itemStore';

const router = useRouter();
const isSubmitting = ref(false);
const itemStore = useItemStore();

const handleSubmit = async (formData) => {
  try {
    isSubmitting.value = true;
    await itemStore.createItem(formData);
    await router.push({name: 'home'});
    // TODO: Add navigation

  } catch (error) {
    console.error('Failed to create item:', error);

  } finally {
    isSubmitting.value = false;
  }
};

</script>

<style scoped>
@import '../styles/components/ItemFormButton.css';
</style>


