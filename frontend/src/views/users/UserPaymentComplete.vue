<template>
  <div class="payment-complete-container box">
    <h1>{{ $t('PaymentCompleteView.title') }}</h1>
    <p>{{ $t('PaymentCompleteView.message') }}</p>
    <div v-if="orderId">
      <p>{{ $t('PaymentCompleteView.order')}} <strong>{{ orderId }}</strong></p>
    </div>
    <CustomButton @click="goHome">{{ $t('PaymentCompleteView.returnHome') }}</CustomButton>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import CustomButton from '@/components/CustomButton.vue';
import { errorMessages } from 'vue/compiler-sfc';

export default {
  name: "UserPaymentComplete",
  components: { CustomButton },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const orderId = ref(null);
    
    onMounted(() => {
      orderId.value = route.query.orderId || null;
      
      if (!orderId.value) {
        errorMessages.value= "Order ID not found.";
      }
    });
    
    const goHome = () => {
      router.push({ name: 'home' });
    };
    
    return { orderId, goHome };
  }
};
</script>

<style>
@import "@/styles/views/users/UserPaymentComplete.css";
</style>