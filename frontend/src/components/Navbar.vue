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
      </ul>
  
      <div class="nav-buttons">
        <button class="button">Sign Up</button>
        <button class="button">Log In</button>
      </div>
    </nav>
  
    <main>
      <h1>Page Content</h1>
      <p>...</p>
    </main>
  </template>

<style scoped>
@import '../styles/Navbar.css';
</style>
