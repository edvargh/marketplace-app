<template>
    <div>
      <h1>Thank you!</h1>
      <p>Your Vipps payment has been processed successfully.</p>
      <button @click="goHome">Return to Home</button>
    </div>
  </template>
  
  <script>
  import { useRouter } from 'vue-router';

  const router = useRouter();

  export default {
    name: "UserPaymentComplete",
    methods: {
      goHome() {
        this.$router.push({ name: 'home' });
      }
    }
  };
  </script>
  