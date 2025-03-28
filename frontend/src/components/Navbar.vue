<template>
    <nav class="nav">
      <ul class="nav-list">
        <li><router-link to="/">Home</router-link></li>
        <li><router-link to="/about">About</router-link></li>
        <li>
          <router-link to="/contact" class="disabled-link">
            Contact (Coming Soon)
          </router-link>
        </li>
        <li><router-link to="/login">Log In</router-link></li>
      </ul>
    </nav>
  
  </template>

<style scoped>
@import '../styles/Navbar.css';
</style>
