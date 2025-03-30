<template>
  <div class="create-item-view">
    <ItemForm
        title="Create New Advertisement"
        @submit="createItem"
        :showStatus="false"
        :initialData="{ status: 'For Sale' }"
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

const uploadImageToCloudinary = async (file) => {
  const uploadFormData = new FormData();
  uploadFormData.append('file', file);
  uploadFormData.append('upload_preset', '<your-upload-preset>'); // TODO: Replace with Cloudinary

  try {
    const response = await axios.post(
        'https://api.cloudinary.com/v1_1/<your-cloud-name>/image/upload', // TODO: Replace with Cloudinary
        uploadFormData
    );
    return response.data.secure_url;

  } catch (error) {
    console.error('Image upload to Cloudinary failed:', error);
    return null;
  }
};

const createItem = async (formData) => {
  if (isSubmitting.value) return;

  try {
    isSubmitting.value = true;

    console.log('Uploading images to Cloudinary...');
    const imageUploadPromises = formData.images.map(image => uploadImageToCloudinary(image.file));
    const imageUrls = await Promise.all(imageUploadPromises);
    if (imageUrls.includes(null)) {
      throw new Error('One or more images failed to upload');
    }
    console.log('Success uploading images: ', imageUrls);

    const payload = {
      title: formData.title,
      price: formData.price,
      city: formData.city,
      category: formData.category,
      description: formData.description,
      status: formData.status,
      images: imageUrls,
    };

    const token = localStorage.getItem('user');

    console.log('Creating item with data:', formData, '...');
    const response = await axios.post('<your-backend-endpoint>', payload, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('Item created successfully:', response.data);
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


