<template>
  <div class="payment-complete-container box">
    <h1>Thank you!</h1>
    <p>Your Vipps payment has been processed successfully.</p>
    <CustomButton @click="goHome">Return to Home</CustomButton>
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