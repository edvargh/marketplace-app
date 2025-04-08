<template>
    <div class="payment-complete-container box">
      <h1>Ops something went wrong</h1>
      <p>Your Vipps payment has not been processed</p>
      <CustomButton @click="goHome">Return to Home</CustomButton>
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
  
  <style scoped>
  @import '../styles/users/UserPaymentComplete.css';
  </style>