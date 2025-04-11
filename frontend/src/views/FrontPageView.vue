<template>
  <div class="front-page">
    <h1>Welcome to Marketplace!</h1>

    <div class="about-us">
      <h3>About Us</h3>
      <div class="about-us-content">
        <img src="/team.png" alt="Team of 3" class="team-image"/>
        <p>Three-person team building a full-stack application for your convenience!</p>
      </div>
    </div>

    <div class="how-it-works">
      <h3>How It Works</h3>
      <p>Buy, sell, and discover great deals on a wide variety of products. Find exactly what you need, or turn your own items into cash with ease!</p>
    </div>

    <div class="start-now">
      <h3>Get started now!</h3>
      <div class="button-container">
        <CustomButton @click="goToLogin" class="login-btn">Log in</CustomButton>
        <CustomButton @click="goToRegister" class="register-btn">Register</CustomButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import CustomButton from "@/components/CustomButton.vue";

const router = useRouter();

const goToLogin = () => {
  router.push('/login');
};

const goToRegister = () => {
  router.push('/register');
};
</script>

<style scoped>
@import '../styles/views/FrontPageView.css';
</style>