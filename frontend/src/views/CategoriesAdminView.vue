<template>
  <LoadingState :loading="loading" :error="error" loadingMessage="Loading categories..."/>

  <NotificationBanner
      v-if="showCreateSuccess"
      type="success"
      message="Category created successfully!"
      :autoClose="true"
      @close="showCreateSuccess = false"
  />
  <NotificationBanner
      v-if="showUpdateSuccess"
      type="success"
      message="Category updated successfully!"
      :autoClose="true"
      @close="showUpdateSuccess = false"
  />
  <NotificationBanner
      v-if="showError"
      type="error"
      :message="errorMessage"
      @close="showError = false"
  />

  <div v-if="!loading && !error" class="categories-page">
    <h1>All Categories</h1>
    <CustomButton @click="openCreateForm">Create new category</CustomButton>

    <table>
      <tbody>
      <tr v-for="category in categories" :key="category.id">
        <td>{{ category.name }}</td>
        <td>
          <CustomButton @click="editCategory(category)" class="edit-button">Edit</CustomButton>
        </td>
      </tr>
      </tbody>
    </table>

    <div v-if="isFormOpen" class="form-container">
      <h2>{{ formMode === 'create' ? 'Create' : 'Update' }} Category</h2>
      <form @submit.prevent="submitForm">
        <InputBox v-model="form.name" type="text" placeholder="Category Name" required class="input-category-name"></InputBox>
        <div class="form-buttons-container">
          <button type="submit" class="action-button button-primary" :disabled="!form.name.trim()">
            {{ formMode === 'create' ? 'Create' : 'Update' }}
          </button>
          <button @click="closeForm" class="action-button button-cancel">Cancel</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useCategoryStore } from '../stores/categoryStore';
import LoadingState from "@/components/LoadingState.vue";
import CustomButton from "@/components/CustomButton.vue";
import InputBox from "@/components/InputBox.vue";
import NotificationBanner from "@/components/NotificationBanner.vue";

const showCreateSuccess = ref(false);
const showUpdateSuccess = ref(false);
const showError = ref(false);
const errorMessage = ref('');
const categoryStore = useCategoryStore();
const loading = ref(true);
const error = ref(null);
const categories = ref([]);
const isFormOpen = ref(false);
const formMode = ref('create');
const form = ref({
  id: null,
  name: '',
  description: ''
});

onMounted(async () => {
  loading.value = true;
  try {
    categories.value = await categoryStore.fetchCategories();
  } catch (e) {
    error.value = "Something wrong happened while loading categories. Please try again.";
  } finally {
    loading.value = false;
  }
});

const showErrorNotification = (message) => {
  errorMessage.value = message;
  showError.value = true;
};

const openCreateForm = () => {
  isFormOpen.value = true;
  formMode.value = 'create';
  form.value = { id: null, name: '', description: '' };
};

const submitForm = async () => {
  if (formMode.value === 'create') {
    await createCategory();
  } else {
    await updateCategory();
  }
  closeForm();
};

const closeForm = () => {
  isFormOpen.value = false;
};

const editCategory = (category) => {
  formMode.value = 'update';
  form.value = { ...category };
  isFormOpen.value = true;
};

const createCategory = async () => {
  try {
    await categoryStore.createCategory({
      name: form.value.name,
      description: form.value.description
    });
    categories.value = await categoryStore.fetchCategories();
    showCreateSuccess.value = true;

  } catch (e) {
    showErrorNotification(e.value);
  }
};

const updateCategory = async () => {
  try {
    await categoryStore.updateCategory(form.value.id, {
      name: form.value.name,
      description: form.value.description
    });
    categories.value = await categoryStore.fetchCategories();
    showUpdateSuccess.value = true;

  } catch (err) {
    showErrorNotification(e.value);
  }
};
</script>



<style scoped>
@import '../styles/components/ItemFormButton.css';

.categories-page {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.categories-page h1 {
  font-size: 2rem;
  font-family: 'Abel', sans-serif;
  font-weight: bold;
  margin-bottom: 1rem;
}

.categories-page h2 {
  font-size: 1.5rem;
  font-family: 'Abel', sans-serif;
  font-weight: bold;
  margin-bottom: 1rem;
}

.categories-page table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 2rem;
}

.categories-page th,
.categories-page td {
  padding: 12px 20px;
  text-align: left;
}

.categories-page th {
  font-weight: bold;
}

.categories-page td:nth-child(1) {
  font-size: 1.5rem;
  width: 80%;
}

.edit-button {
  height: 20px;
}

.form-container {
  margin-top: 100px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  border-top: 1px solid #888888;
  padding-top: 40px;
}

.input-category-name {
  margin: 0;
}

.categories-page form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-buttons-container {
  display: flex;
  gap: 10px;
}
</style>
