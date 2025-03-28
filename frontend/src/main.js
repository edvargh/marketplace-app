import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router/router'
import {userAuth} from './composables/userAuth.js'

const app = createApp(App)

const auth = userAuth()
auth.checkAuth()

app.use(router)

app.mount('#app')
