<template>
  <div class="create-item-view">
    <ItemForm
        title="Create New Advertisement"
        @submit="createItem"
    >
      <template #actions="{ isValid }">
        <button
            type="submit"
            class="create-button"
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

const router = useRouter();
const isSubmitting = ref(false);

const createItem = async (formData) => {
  if (isSubmitting.value) return;

  try {
    isSubmitting.value = true;
    console.log('Creating item with data:', formData);
    await new Promise(resolve => setTimeout(resolve, 1000));
    await router.push({ name: 'items' });

  } catch (error) {
    console.error('Error creating item:', error);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
@import '../styles/CreateItemView.css';
</style>


