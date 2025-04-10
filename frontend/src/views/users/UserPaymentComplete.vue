<template>
  <div class="payment-complete-container box">
    <h1>{{ $t('PaymentCompleteView.title') }}</h1>
    <p>{{ $t('PaymentCompleteView.message') }}</p>
    <CustomButton @click="goHome">{{ $t('PaymentCompleteView.returnHome') }}</CustomButton>
  </div>
</template>

<script>
import CustomButton from '@/components/CustomButton.vue'

export default {
  name: "UserPaymentComplete",
  components: { CustomButton },
  methods: {
    goHome() {
      this.$router.push({ name: 'home' });
    }
  }
};
</script>

<style scoped>
@import '../styles/users/UserPaymentComplete.css';
</style>