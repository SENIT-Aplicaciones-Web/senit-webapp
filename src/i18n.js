import { createI18n } from 'vue-i18n'
import es from './locales/es.json'
import en from './locales/en.json'

const storedLocale = typeof localStorage !== 'undefined'
  ? localStorage.getItem('senit-webapp-locale')
  : null

const i18n = createI18n({
    legacy: false,
    locale: storedLocale || 'es',
    fallbackLocale: 'en',
    messages: { es, en }
})

export default i18n
