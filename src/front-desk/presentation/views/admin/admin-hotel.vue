<script setup>
import { reactive, ref, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import useHotelOperationsStore from '../../../application/front-desk.store.js'

const router = useRouter()
const operationsStore = useHotelOperationsStore()
const { t } = useI18n()
const feedback = ref({ type: '', message: '' })
const form = reactive({ name: '', ruc: '', address: '', phone: '', email: '', plan: '' })

watchEffect(() => {
  if (!operationsStore.activeHotel) return
  Object.assign(form, operationsStore.activeHotel)
})

function saveHotel() {
  const result = operationsStore.updateHotel({ name: form.name, ruc: form.ruc, address: form.address, phone: form.phone, email: form.email })
  feedback.value = { type: result.ok ? 'success' : 'error', message: result.message }
}

function resolveFeedbackMessage(message) {
  return /^[a-z0-9.-]+$/.test(message ?? '') ? t(message) : message
}
</script>

<template>
  <section class="page-shell">
    <section class="page-header"><div><h1>{{ t('admin.hotel.title') }}</h1><p>{{ t('admin.hotel.subtitle') }}</p></div></section>
    <section class="form-card">
      <div class="panel-header"><h2>{{ t('admin.hotel.establishment-data') }}</h2></div>
      <form class="form-grid" @submit.prevent="saveHotel">
        <div class="form-field"><label>{{ t('admin.hotel.commercial-name') }}</label><pv-input-text v-model="form.name" /></div>
        <div class="form-field"><label>{{ t('admin.hotel.ruc') }}</label><pv-input-text v-model="form.ruc" /></div>
        <div class="form-field full"><label>{{ t('admin.hotel.address') }}</label><pv-input-text v-model="form.address" /></div>
        <div class="form-field"><label>{{ t('admin.hotel.phone') }}</label><pv-input-text v-model="form.phone" /></div>
        <div class="form-field"><label>{{ t('admin.hotel.email') }}</label><pv-input-text v-model="form.email" /></div>
        <div class="form-field"><label>{{ t('admin.hotel.plan') }}</label><input :value="form.plan" disabled /></div>
        <div class="form-field plan-button-field">
          <button class="secondary-button" type="button" @click="router.push({ name: 'admin-subscription' })"><i class="pi pi-credit-card"></i>{{ t('admin.hotel.manage-subscription') }}</button>
        </div>
        <div class="form-field full" style="justify-content:end;"><button class="primary-button" type="submit"><i class="pi pi-save"></i>{{ t('admin.hotel.save-changes') }}</button></div>
      </form>
      <p v-if="feedback.message" class="feedback" :class="feedback.type">{{ resolveFeedbackMessage(feedback.message) }}</p>
    </section>
  </section>
</template>

<style scoped>
.plan-button-field { justify-content: end; }
</style>
