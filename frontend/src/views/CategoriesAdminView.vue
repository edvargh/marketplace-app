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
        <td>
          <div class="category-name">{{ category.name }}</div>
        </td>
        <td>
          <CustomButton @click="editCategory(category)" class="edit-button">Edit</CustomButton>
        </td>
      </tr>
      </tbody>
    </table>

    <div v-if="isFormOpen" class="form-container">
      <h2>{{ formMode === 'create' ? 'Create' : 'Update' }} Category</h2>
      <form @submit.prevent="submitForm">
        <InputBox v-model="form.name" type="text" placeholder="Category Name" required class="input-category-name"/>
        <div v-if="nameError" class="error-message">{{ nameError }}</div>
        <div class="form-buttons-container">
          <button type="submit" class="action-button button-primary" :disabled="isSubmitDisabled">
            {{ formMode === 'create' ? 'Create' : 'Update' }}
          </button>
          <button @click="closeForm" class="action-button button-cancel">Cancel</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
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
const maxNameLength = 30;
const nameError = ref('');
const form = ref({
  id: null,
  name: '',
  description: ''
});

watch(() => form.value.name, (newName) => {
  nameError.value = '';
  if (newName && newName.length > maxNameLength) {
    nameError.value = `Category name cannot exceed ${maxNameLength} characters`;
  }
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

const isSubmitDisabled = computed(() => {
  return !form.value.name.trim() || nameError.value !== '';
});


const openCreateForm = () => {
  isFormOpen.value = true;
  formMode.value = 'create';
  form.value = { id: null, name: '', description: '' };
};

const submitForm = async () => {
  if (nameError.value) return;
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
@import '../styles/views/CategoriesAdminView.css';
</style>
