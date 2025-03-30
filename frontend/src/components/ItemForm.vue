<template>
  <div class="item-form">
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
  <form class="item-form" @submit.prevent="handleSubmit">

        <!-- Status -->
        <label for="status">Status</label>
        <SelectBox
            label="Status"
            v-model="formData.status"
            :options="status"
            placeholder="Status"
            required
        />

        <!-- Title and price -->
        <label for="Title">Title</label>
        <InputBox label="Title" v-model="formData.title" placeholder="Title" required />
        <label for="Price">Price</label>
        <InputBox label="Price" v-model="formData.price" type="number" placeholder="Price" required />


        <!-- Category -->
        <label for="Category">Category</label>
        <SelectBox
            label="Category"
            v-model="formData.category"
            :options="categories"
            placeholder="Category"
            required
        />

        <!-- Sub-Category -->
        <SelectBox
            v-if="formData.category"
            label="Sub-category"
            v-model="formData.subCategory"
            :options="subCategories[formData.category] || []"
            placeholder="Sub-category"
            required
        />

        <!-- City -->
        <label for="city">City</label>
        <InputBox label="City" v-model="formData.city" placeholder="City" required />

        <!-- TODO: Use Box component -->
        <label for="description">Description</label>
        <InputBox label="Description" v-model="formData.description" placeholder="Description" required />


      <!-- Form Actions (implement buttons at bottom for child components) -->
      <div class="form-actions">
        <slot name="actions" :isValid="isFormValid"></slot>
      </div>

    </form>
</template>


<script setup>
import { ref, reactive, onBeforeUnmount, computed, watch, onMounted } from 'vue'
import InputBox from '@/components/InputBox.vue'
import ImageGallery from '@/components/ImageGallery.vue'
import SelectBox from "@/components/SelectBox.vue";
import CustomButton from "@/components/CustomButton.vue";

const fileInput = ref(null);
const categories = ref(['Test']);
// const subCategories = ref({});
const status = ['Test'] // TODO: Change

const props = defineProps({
  title: String,
  initialData: {
    type: Object,
    default: () => ({})
  }
});
// TODO: Change
const formData = reactive({
  title: '',
  price: '',
  city: '',
  category: '',
  subCategory: '',
  description: '',
  images: [],
  currentImageIndex: 0,
  status: '',
  ...props.initialData
});


onMounted(async () => {
  try {
    // Fetch categories (id + name)
    const categoriesResponse = await axios.get('<your-backend-endpoint>/categories'); // TODO: Change
    categories.value = categoriesResponse.data.map(category => ({
      value: category.id,
      label: category.name
    }));

    /*
    // Fetch subcategories for each category
    const subcategoriesResponse = await Promise.all(categories.value.map(category =>
        axios.get(`<your-backend-endpoint>/categories/${category.value}/subcategories`) // TODO: Change
    ));

    // Organize subcategories by category ID
    subCategories.value = subcategoriesResponse.reduce((acc, res, index) => {
      const categoryId = categories.value[index].value;
      acc[categoryId] = res.data.map(subcategory => ({
        value: subcategory.id,
        label: subcategory.name
      }));
      return acc;
    }, {});

     */
  } catch (error) {
    console.error('Error fetching categories or subcategories:', error);
  }
});

const handleImageUpload = (event) => {
  const files = event.target.files;
  if (!files || files.length === 0) return;

  const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));

  const newImages = imageFiles.map(file => ({
    url: URL.createObjectURL(file),
    file,
    name: file.name,
    size: file.size,
    type: file.type
  }));

  formData.images = [...formData.images, ...newImages];

  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

onBeforeUnmount(() => {
  formData.images.forEach(image => URL.revokeObjectURL(image.url));
});

const triggerFileInput = () => {
  fileInput.value.click();
};

const removeCurrentImage = () => {
  if (formData.images.length === 0) return;

  // Clean up the current image URL
  const removedImage = formData.images[formData.currentImageIndex];
  if (removedImage?.url) {
    URL.revokeObjectURL(removedImage.url);
  }

  // Create a new array without the current image
  const updatedImages = [
    ...formData.images.slice(0, formData.currentImageIndex),
    ...formData.images.slice(formData.currentImageIndex + 1)
  ];

  // Update the reactive state
  formData.images = updatedImages;

  // Handle index update
  if (updatedImages.length === 0) {
    formData.currentImageIndex = 0;
  } else if (formData.currentImageIndex >= updatedImages.length) {
    formData.currentImageIndex = updatedImages.length - 1;
  }
};


const isFormValid = computed(() => {
  const requiredFields = [
    // Images are not a required field
    formData.status,
    formData.title,
    formData.price,
    formData.category,
    // formData.subCategory,
    formData.city,
    formData.description
  ];

  const hasAllRequiredFields = requiredFields.every(field => !!field);
  const isPriceValid = formData.price > 0;
  return hasAllRequiredFields && isPriceValid;
});

const emit = defineEmits(['submit', 'validation-change'])

const handleSubmit = () => {
  if (isFormValid.value) {
    emit('submit', formData);
  }
}

watch(isFormValid, (newVal) => {
  console.log('Form validation changed:', newVal);
  console.log('Current field states:', formData);
});


</script>


<style scoped>
@import '../styles/ItemForm.css';
</style>