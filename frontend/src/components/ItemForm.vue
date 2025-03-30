<template>
  <div class="item-form">
    <div class="title">
      <h1>{{ title }}</h1>
    </div>

    <!-- Images Gallery Section -->
    <div class="form-section" id="gallery-control-container">
      <ImageGallery
          :images="formData.images"
          :showFavoriteButton="false"
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


    <form @submit.prevent="handleSubmit">
      <!-- Information Input -->
      <div class="form-section">

        <!-- Status -->
        <SelectBox
            label="Status"
            v-model="formData.status"
            :options="status"
            placeholder="Status"
            required
        />

        <!-- Title and price -->
        <InputBox label="Title" v-model="formData.title" placeholder="Title" required />
        <InputBox label="Price" v-model="formData.price" type="number" placeholder="Price" required />

        <!-- Category -->
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
            :options="subCategories[formData.category]"
            :categoryId="formData.category"
        placeholder="Sub-category"
        />

        <!-- City -->
        <InputBox label="City" v-model="formData.city" placeholder="City" required />

        <!-- TODO: Use Box component -->
        <InputBox label="Description" v-model="formData.description" placeholder="Description" required />
      </div>

      <!-- Form Actions (implement buttons at bottom for child components) -->
      <div class="form-actions">
        <slot name="actions" :isValid="isFormValid"></slot>
      </div>

    </form>
  </div>
</template>


<script setup>
import { ref, reactive, onBeforeUnmount, computed, watch } from 'vue'
import InputBox from '@/components/InputBox.vue'
import ImageGallery from '@/components/ImageGallery.vue'
import SelectBox from "@/components/SelectBox.vue";
import CustomButton from "@/components/CustomButton.vue";

const fileInput = ref(null);
const props = defineProps({
  title: String,
  initialData: {
    type: Object,
    default: () => ({})
  }
})
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
})

// TODO: Figure out how to implement categories etc.
const status = ['For Sale', 'Reserved', 'Sold']
const categories = ['Kitchen', 'Cars', 'Tech', 'Sports', 'Houses']
const subCategories = {
  Kitchen: ['Spoon', 'Fork', 'Knife', 'Plate', 'Pot'],
  Cars: ['Sedan', 'SUV', 'Truck', 'Electric', 'Vintage'],
  Tech: ['TV', 'Laptop', 'Phone', 'Tablet', 'Camera'],
  Sports: ['Football', 'Swimming', 'Bicycles', 'Running', 'Yoga'],
  Houses: ['Apartment', 'Mansion', 'Villa', 'Cabin', 'Studio']
}


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

  const imageToRemove = formData.images[formData.currentImageIndex];

  if (imageToRemove.url) {
    URL.revokeObjectURL(imageToRemove.url);
  }

  formData.images.splice(formData.currentImageIndex, 1);

  if (formData.currentImageIndex >= formData.images.length && formData.images.length > 0) {
    formData.currentImageIndex = formData.images.length - 1;
  }
};

const isFormValid = computed(() => {
  const requiredFields = [
    // Images are not a required field
    formData.status,
    formData.title,
    formData.price,
    formData.category,
    formData.subCategory,
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
  console.log('Form validation changed:', newVal,);
  console.log('Current field states:', {
    status: formData.status,
    title: formData.title,
    price: formData.price,
    category: formData.category,
    subCategory: formData.subCategory,
    city: formData.city,
    description: formData.description
  });
});

</script>


<style scoped>
@import '../styles/ItemForm.css';
</style>