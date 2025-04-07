<template>
  <div class="categories">
    <h3 class="font">{{ t("categories.Most-popular-categories") }}</h3>
    <ul>
      <li v-for="category in categories" :key="category.id">
        <CustomButton class="circle-button" @click="handleCategoryClick(category)">
          <span class="font">{{ category.name }}</span>
        </CustomButton>
      </li>
    </ul>
  </div>
</template>

<script setup>
import CustomButton from '@/components/CustomButton.vue'
import { useI18n } from 'vue-i18n';

defineProps({
  categories: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['category-click']);
const { t } = useI18n();

const handleCategoryClick = (category) => {
  emit('category-click', category);
};
</script>


<style scoped>
@import '../styles/components/Categories.css';
</style>