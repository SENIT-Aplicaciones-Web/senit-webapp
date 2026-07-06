import { createI18n } from 'vue-i18n'
import es from './locales/es.json'
import en from './locales/en.json'

const SUPPORTED_LOCALES = ['es', 'en']
const storedLocale = typeof localStorage !== 'undefined'
  ? localStorage.getItem('senit-webapp-locale')
  : null
const initialLocale = SUPPORTED_LOCALES.includes(storedLocale) ? storedLocale : 'es'

if (typeof localStorage !== 'undefined' && storedLocale && !SUPPORTED_LOCALES.includes(storedLocale)) {
  localStorage.setItem('senit-webapp-locale', initialLocale)
}

const i18n = createI18n({
    legacy: false,
    locale: initialLocale,
    fallbackLocale: 'en',
    messages: { es, en }
})

export default i18n
