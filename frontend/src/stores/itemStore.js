import { ref } from 'vue';
import axios from 'axios';

const isSubmitting = ref(false);

const uploadImageToCloudinary = async (file) => {
  const uploadFormData = new FormData();
  uploadFormData.append('file', file);
  uploadFormData.append('upload_preset', '<your-upload-preset>'); // Replace with your Cloudinary upload preset

  try {
    const response = await axios.post(
        'https://api.cloudinary.com/v1_1/<your-cloud-name>/image/upload', // Replace with your Cloudinary URL
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
    const imageUploadPromises = formData.images.map((image) => uploadImageToCloudinary(image.file));
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
    const response = await axios.post('<your-backend-endpoint>', payload, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    console.log('Item created successfully:', response.data);
    return response.data;

  } catch (error) {
    console.error('Error creating item:', error);
    throw error;
  } finally {
    isSubmitting.value = false;
  }
};

export default {
  isSubmitting,
  createItem,
};
