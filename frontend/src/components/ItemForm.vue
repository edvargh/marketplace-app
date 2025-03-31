<template>
  <div class="item-form-page">
    <div class="title">
      <h1>{{ title }}</h1>
    </div>

    <!-- Images Gallery Section -->
    <ImageGallery
        :images="formData.images"
        :show-favorite-button="false"
        :current-index="formData.currentImageIndex"
        @update:current-index="val => formData.currentImageIndex = val"
    />

    <!-- Image Upload/Remove Buttons -->
    <div class="image-controls">
      <input
          type="file"
          ref="fileInput"
          @change="handleImageUpload"
          multiple
          accept="image/*"
          style="display: none"
      />
      <CustomButton type="button" class="upload-button" @click="triggerFileInput">
        Import Images
      </CustomButton>

      <CustomButton
          type="button"
          @click="removeCurrentImage"
          :disabled="formData.images.length === 0">
        Remove Current Image
      </CustomButton>
    </div>
  </div>

  <!-- Form -->
  <div class="item-form-page" id="item-form">
    <form class="item-form" @submit.prevent="handleSubmit">

      <!-- Status. Can choose to display or not -->
      <div v-if="showStatus">
        <label for="status">Status</label>
        <SelectBox
            label="Status"
            v-model="formData.status"
            placeholder="Status"
            required
        />
      </div>

      <!-- Title and price -->
      <label for="Title">Title</label>
      <InputBox label="Title" v-model="formData.title" placeholder="Title" required />
      <label for="Price">Price</label>
      <InputBox label="Price" v-model="formData.price" type="number" placeholder="Price" required />
      <div v-if="priceError" class="error-message">
        {{ priceError }}
      </div>

      <!-- Category -->
      <label for="Category">Category</label>
      <SelectBox
          label="Category"
          v-model="formData.categoryId"
          :options="categories"
          option-label="name"
          option-value="id"
          placeholder="Category"
          required
      />

      <!-- City -->
      <label for="city">City</label>
      <InputBox label="City" v-model="formData.city" placeholder="City" required />

      <!-- Description -->
      <label for="description">Description</label>
      <CustomTextarea v-model="formData.description" placeholder="Description" :required="true"/>

      <!-- Form Actions (implement buttons at bottom for child components) -->
      <div class="form-actions">
        <slot name="actions" :isValid="isFormValid"></slot>
      </div>
    </form>

  </div>
</template>


<script setup>
import { ref, reactive, onBeforeUnmount, computed, onMounted, watch } from 'vue'
import InputBox from '@/components/InputBox.vue'
import ImageGallery from '@/components/ImageGallery.vue'
import SelectBox from "@/components/SelectBox.vue";
import CustomButton from "@/components/CustomButton.vue";
import CustomTextarea from "@/components/CustomTextarea.vue";
import { useCategoryStore } from "@/stores/categoryStore";

const fileInput = ref(null);
const categories = ref([]);
const priceError = ref('');
const categoryStore = useCategoryStore();

const props = defineProps({
  title: String,
  initialData: {
    type: Object,
    default: () => ({})
  },
  showStatus: {
    type: Boolean,
    default: true
  }
});

const formData = reactive({
  title: '',
  price: '',
  city: '',
  categoryId: null,
  description: '',
  images: [],
  currentImageIndex: 0,
  status: '',
  ...props.initialData
});

watch(() => formData.price, (newPrice) => {
  validatePrice(newPrice);
});

const validatePrice = (price) => {
  if (price === '' || price === null) {
    priceError.value = '';
    return false;
  }

  const numPrice = Number(price);
  if (numPrice < 0) {
    priceError.value = 'Please provide a valid price';
    return false;
  }

  priceError.value = '';
  return true;
};

onMounted(async () => {
  try {
    // Fetch and display categories in markdown menu
    categoryStore.fetchCategories().then(cats => {
      categories.value = cats.map(category => ({
        name: category.name,
        id: category.id
      }));
    });
  } catch (error) {
    console.error('Error loading data:', error);
  }
});

const handleImageUpload = (event) => {
  const files = event.target.files;
  if (!files?.length) return;

  formData.images = [
    ...formData.images,
    ...Array.from(files)
        .filter(file => file.type.startsWith('image/'))
        .map(file => ({ file, url: URL.createObjectURL(file) }))
  ];

  fileInput.value.value = '';
};

const removeCurrentImage = () => {
  if (!formData.images.length) return;

  URL.revokeObjectURL(formData.images[formData.currentImageIndex]?.url);
  formData.images.splice(formData.currentImageIndex, 1);

  // Adjust current index if needed
  if (formData.currentImageIndex >= formData.images.length) {
    formData.currentImageIndex = Math.max(0, formData.images.length - 1);
  }
};

onBeforeUnmount(() => {
  formData.images.forEach(image => URL.revokeObjectURL(image.url));
});

const triggerFileInput = () => {
  fileInput.value.click();
};

const isFormValid = computed(() => {
  const requiredFields = [
    formData.status,
    formData.title,
    formData.price,
    formData.categoryId,
    formData.city,
    formData.description
  ];

  const hasAllRequiredFields = requiredFields.every(field => !!field);
  const isPriceValid = formData.price >= 0;
  return hasAllRequiredFields && isPriceValid;
});

const emit = defineEmits(['submit', 'validation-change'])

const handleSubmit = async () => {
  if (!isFormValid.value) return;
  try {
    emit('submit', formData);

  } catch (error) {
    console.error('Error preparing form data:', error);
    emit('error', 'Failed to prepare form data');
  }
};
</script>


<style scoped>
@import '../styles/components/ItemForm.css';
</style>