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
import InputNumber from 'primevue/inputnumber'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import SelectButton from 'primevue/selectbutton'
import Dialog from 'primevue/dialog'
import Tag from 'primevue/tag'
import Card from 'primevue/card'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

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
    .component('pv-input-number', InputNumber)
    .component('pv-textarea', Textarea)
    .component('pv-select', Select)
    .component('pv-select-button', SelectButton)
    .component('pv-dialog', Dialog)
    .component('pv-tag', Tag)
    .component('pv-card', Card)
    .component('pv-data-table', DataTable)
    .component('pv-column', Column)
    .mount('#app')
