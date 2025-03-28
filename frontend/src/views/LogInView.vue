<template>
  <div class = "logInWrapper">
  <div class="logInPage">
    <h1>Log In</h1>
    <form>
      <label for="email">email</label>
      <InputBox>
        <input
          type="email"
          id="email"
          name="email"
          v-model="email"
          required
          placeholder="Enter your email"
        />
      </InputBox>

      <label for="password">Password</label>
      <InputBox>
        <input
          type="password"
          id="password"
          name="password"
          v-model="password"
          required
          placeholder="Enter your password"
        />
      </InputBox>

      <button type="submit">Log In</button>
    </form>

    <div>
      <p class="noAccountText">
        Don't have an account? <router-link to="/signup">Sign Up</router-link>
      </p>
    </div>
  </div>
  </div>
</template>


<script setup>
import InputBox from '@/components/InputBox.vue'
import { ref } from 'vue'

const email = ref('')
const password = ref('')
</script>


<style scoped>
@import '../styles/LogInView.css';
</style>
