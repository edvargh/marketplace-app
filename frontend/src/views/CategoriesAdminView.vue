<template>
  <LoadingState :loading="loading" :error="error" :loadingMessage="t('categoriesAdmin.loadingCategories')" />
  <ErrorMessage v-if="!loading && errorMessage" :message="errorMessage" />

  <NotificationBanner
      v-if="showCreateSuccess"
      type="success"
      :message="t('categoriesAdmin.successCreate')"
      :autoClose="true"
      :showClose="true"
      @close="showCreateSuccess = false"
  />
  <NotificationBanner
      v-if="showUpdateSuccess"
      type="success"
      :message="t('categoriesAdmin.successUpdate')"
      :autoClose="true"
      :showClose="true"
      @close="showUpdateSuccess = false"
  />

  <div v-if="!loading && !error" class="categories-page">
    <h1>{{ t('categoriesAdmin.allCategories') }}</h1>
    <CustomButton @click="openCreateForm">{{ t('categoriesAdmin.createNewCategory') }}</CustomButton>

    <table>
      <tbody>
      <tr v-for="category in categories" :key="category.id">
        <td>
          <div class="category-name">{{ category.name }}</div>
        </td>
        <td>
          <CustomButton @click="editCategory(category)" class="edit-button">{{ t('categoriesAdmin.edit') }}</CustomButton>
        </td>
      </tr>
      </tbody>
    </table>

    <div v-if="isFormOpen" class="form-container">
      <h2>{{ formMode === 'create' ? t('categoriesAdmin.createCategory') : t('categoriesAdmin.updateCategory') }}</h2>
      <form @submit.prevent="submitForm">
        <InputBox v-model="form.name" type="text" :placeholder="t('categoriesAdmin.categoryName')" required class="input-category-name"/>
        <div v-if="nameError" class="error-message">{{ nameError }}</div>
        <div class="form-buttons-container">
          <button type="submit" class="action-button button-primary" :disabled="isSubmitDisabled">
            {{ formMode === 'create' ? t('categoriesAdmin.create') : t('categoriesAdmin.update') }}
          </button>
          <button @click="closeForm" class="action-button button-cancel">{{ t('categoriesAdmin.cancel') }}</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useCategoryStore } from '../stores/categoryStore';
import { useI18n } from 'vue-i18n'
import LoadingState from "@/components/LoadingState.vue";
import CustomButton from "@/components/CustomButton.vue";
import InputBox from "@/components/InputBox.vue";
import NotificationBanner from "@/components/NotificationBanner.vue";
import ErrorMessage from '@/components/ErrorMessage.vue';

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
const { t } = useI18n()
const form = ref({
  id: null,
  name: '',
  description: ''
});

const showErrorNotification = (message) => {
  errorMessage.value = message;
  showError.value = true;
  setTimeout(() => {
    errorMessage.value = '';
  }, 5000);
};

watch(() => form.value.name, (newName) => {
  nameError.value = '';
  if (newName && newName.length > maxNameLength) {
    nameError.value = t('categoriesAdmin.categoryNameError', { maxLength: maxNameLength });
  }
});

onMounted(async () => {
  loading.value = true;
  try {
    categories.value = await categoryStore.fetchCategories();
  } catch (err) {
    error.value = t('categoriesAdmin.errorLoad');
  } finally {
    loading.value = false;
  }
});

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

  } catch (err) {
    showErrorNotification(t('categoriesAdmin.errorCreate'));
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
    showErrorNotification(t('categoriesAdmin.errorUpdate'));
  }
};
</script>


<style scoped>
@import '../styles/views/CategoriesAdminView.css';
</style>
