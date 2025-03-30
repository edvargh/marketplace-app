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
.create-item-view {
}

.create-button {
  background-color: #2e7d15;
  color: white;
  padding: 0.75rem;
  border-radius: 25px;
  border: none;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.create-button:hover {
  transform: scale(1.03);
  background-color: #45a049;
}

.create-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

</style>


