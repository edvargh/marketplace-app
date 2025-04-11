import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router/router'
import { createPinia } from 'pinia'
import { i18n } from './i18n'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

import { useUserStore } from './stores/userStore'
import { useI18nStore } from './stores/languageStore'

app.use((_) => {
  const userStore = useUserStore()
  const i18nStore = useI18nStore()
  
  i18nStore.initLocale()
  
  userStore.$subscribe((_, state) => {
    if (state.user?.preferredLanguage) {
      i18nStore.syncWithUserPreferences(state.user.preferredLanguage)
    }
  })
})

app.use(router)
app.use(i18n)
app.mount('#app')