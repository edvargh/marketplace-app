import { createI18n } from 'vue-i18n'
import english from './locales/en.json'
import norwegian from './locales/no.json'

export const i18n = createI18n({
  legacy: false, 
  locale: 'english',
  fallbackLocale: 'english',
  messages: {
    english,
    norwegian
  }
})

