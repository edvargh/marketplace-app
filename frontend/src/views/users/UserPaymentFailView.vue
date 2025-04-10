<template>
  <div class="payment-complete-container box">
    <h1>{{ $t('PaymentFailView.title') }}</h1>
    <p>{{ $t('PaymentFailView.message') }}</p>
    <CustomButton @click="goHome">{{ $t('PaymentFailView.returnHome') }}</CustomButton>
  </div>
</template>

<script>
import CustomButton from '@/components/CustomButton.vue'

export default {
  name: "UserPaymentFail",
  components: { CustomButton },
  methods: {
    goHome() {
      this.$router.push({ name: 'home' });
    }
  }
};
</script>

<style>
@import "@/styles/views/users/UserPaymentComplete.css";
</style>