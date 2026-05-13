import { createApp } from 'vue'
import './style.css'
import App from './app.vue'

import router from './router.js'
import pinia from './pinia.js'
import i18n from './i18n.js'

import PrimeVue from 'primevue/config'
import Material from '@primeuix/themes/material'

import 'primeicons/primeicons.css'
import 'primeflex/primeflex.css'

import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import SelectButton from 'primevue/selectbutton'

createApp(App)
    .use(router)
    .use(pinia)
    .use(i18n)
    .use(PrimeVue, {
        theme: {
            preset: Material
        },
        ripple: true
    })
    .component('pv-button', Button)
    .component('pv-input-text', InputText)
    .component('pv-select-button', SelectButton)
    .mount('#app')