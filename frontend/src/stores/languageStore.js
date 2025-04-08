import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { i18n } from '@/i18n' 

export const useI18nStore = defineStore('i18n', () => {
  const currentLocale = ref(i18n.global.locale.value)
  
  const initLocale = () => {
    const savedLocale = localStorage.getItem('locale')
    
    const userData = JSON.parse(localStorage.getItem('user'))
    const userPreferredLanguage = userData?.preferredLanguage
    
    if (userPreferredLanguage) {
      setLocale(userPreferredLanguage)
    } else if (savedLocale) {
      setLocale(savedLocale)
    } else {
      const browserLocale = navigator.language.split('-')[0]
      const availableLocales = i18n.global.availableLocales
      
      if (availableLocales.includes(browserLocale)) {
        setLocale(browserLocale)
      }
    }
  }
  
  const setLocale = (locale) => {
    i18n.global.locale.value = locale
    currentLocale.value = locale
    localStorage.setItem('locale', locale)
  }
  
  const syncWithUserPreferences = (preferredLanguage) => {
    if (preferredLanguage && preferredLanguage !== currentLocale.value) {
      setLocale(preferredLanguage)
    }
  }
  
  return {
    currentLocale,
    setLocale,
    initLocale,
    syncWithUserPreferences
  }
})