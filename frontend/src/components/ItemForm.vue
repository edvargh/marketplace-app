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
        {{ t('itemFormComponent.importImages') }}
      </CustomButton>

      <CustomButton
          type="button"
          @click="removeCurrentImage"
          :disabled="formData.images.length === 0">
          {{ t('itemFormComponent.removeCurrentImage') }}
      </CustomButton>
    </div>
  </div>

  <!-- Form -->
  <div class="item-form-page" id="item-form">
    <form class="item-form" @submit.prevent="handleSubmit">

      <!-- Status. Can choose to display or not -->
      <div v-if="showStatus">
        <label for="status">{{ t('itemFormComponent.status') }}</label>
        <SelectBox
            label="Status"
            class="status-select-box"
            v-model="formData.status"
            :options="statusOptions"
            option-label="label"
            option-value="value"
            :placeholder="t('itemFormComponent.placeholders.status')"
            required
        />
      </div>

      <!-- Category -->
      <label for="Category">{{ t('itemFormComponent.category') }}</label>
      <SelectBox
          label="Category"
          class="category-select-box"
          v-model="formData.categoryId"
          :options="categories"
          option-label="name"
          option-value="id"
          :placeholder="t('itemFormComponent.placeholders.category')"
          required
      />

      <!-- Title -->
      <label for="Title">{{ t('itemFormComponent.title') }}</label>
      <InputBox label="Title" v-model="formData.title" class="input-title"
      :placeholder="t('itemFormComponent.placeholders.title')"
      required />
      <div v-if="titleError" class="error-message">
        {{ titleError }}
      </div>

      <!-- Description -->
      <label for="description">{{ t('itemFormComponent.description') }}</label>
      <CustomTextarea v-model="formData.description" class="input-description"
      :placeholder="t('itemFormComponent.placeholders.description')"
      :required="true"/>
      <div v-if="descriptionError" class="error-message">
        {{ descriptionError }}
      </div>


      <!-- Price -->
      <label for="Price">{{ t('itemFormComponent.price') }}</label>
      <InputBox label="Price" class="input-price"
       v-model="formData.price" type="number" 
       :placeholder="t('itemFormComponent.placeholders.price')"
       required />
      <div v-if="priceError" 
      class="error-message">
        {{ priceError }}
      </div>

      <!-- Location -->
      <LocationDisplay
          :lat="formData.latitude"
          :lng="formData.longitude"
          :is-edit-mode="true"
          @update:lat="(val) => formData.latitude = val"
          @update:lng="(val) => formData.longitude = val"
      />
      <div v-if="!formData.latitude || !formData.longitude" class="error-message">
        {{ t('itemFormComponent.selectLocation') }}
      </div>

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
import LocationDisplay from "@/components/LocationDisplay.vue";
import { useCategoryStore } from "@/stores/categoryStore";
import { useI18n } from 'vue-i18n';

const categoryStore = useCategoryStore();
const fileInput = ref(null);
const categories = ref([]);
const priceError = ref('');
const titleError = ref('');
const descriptionError = ref('');

const maxTitleLength = 50;
const maxDescriptionLength = 600;
const minPrice = 0;
const maxPrice = 10000000;

const { t } = useI18n();

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

// Status options
const statusOptions = ref([
  { value: 'FOR_SALE', label: t('itemFormComponent.statusOptions.forSale') },
  { value: 'RESERVED', label: t('itemFormComponent.statusOptions.reserved') },
  { value: 'SOLD', label: t('itemFormComponent.statusOptions.sold') }
]);

const formData = reactive({
  ...props.initialData,
  status: 'FOR_SALE'
});

watch(() => props.initialData, (newData) => {
  Object.assign(formData, newData);
}, { deep: true, immediate: true });

// Price validator
watch(() => formData.price, (newPrice) => {
  validatePrice(newPrice);
});

const validatePrice = (price) => {
  priceError.value = '';
  if (price === '' || price === null) {
    return false;
  }
  const numPrice = Number(price);
  const validations = [
    { condition: isNaN(numPrice), message: t('itemFormComponent.validation.invalidNumber') },
    { condition: numPrice < minPrice, message: t('itemFormComponent.validation.negativePrice') },
    { condition: numPrice > maxPrice, message: t('itemFormComponent.validation.tooHighPrice') }
  ];
  const failedValidation = validations.find(validation => validation.condition);
  if (failedValidation) {
    priceError.value = failedValidation.message;
    return false;
  }
  return true;
};

// Title and description validator
watch(
  () => [formData.title, formData.description],
  ([newTitle, newDescription]) => {
    titleError.value =
      newTitle && newTitle.length > maxTitleLength
        ? `Title cannot exceed ${maxTitleLength} characters`
        : '';
    descriptionError.value =
      newDescription && newDescription.length > maxDescriptionLength
        ? `Description cannot exceed ${maxDescriptionLength} characters`
        : '';
  }
);

onMounted(async () => {
  try {
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
  const newImages = [
    ...formData.images,
    ...Array.from(files)
        .filter(file => file.type.startsWith('image/'))
        .map(file => ({ file, url: URL.createObjectURL(file) }))
  ];
  formData.images = newImages;
  fileInput.value.value = '';
};

const removeCurrentImage = () => {
  if (!formData.images.length) return;
  const newImages = [...formData.images];
  URL.revokeObjectURL(newImages[formData.currentImageIndex]?.url);
  newImages.splice(formData.currentImageIndex, 1);
  formData.images = newImages;
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
    formData.description,
    formData.latitude,
    formData.longitude
  ];

  const hasAllRequiredFields = requiredFields.every(field => !!field);
  const isPriceValid = formData.price >= 0;
  const noTextErrors = !titleError.value && !descriptionError.value;
  return hasAllRequiredFields && isPriceValid && noTextErrors;
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