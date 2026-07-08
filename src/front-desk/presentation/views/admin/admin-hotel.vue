<script setup>
import { reactive, ref, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import useHotelOperationsStore from '../../../application/front-desk.store.js'

const router = useRouter()
const operationsStore = useHotelOperationsStore()
const { t } = useI18n()
const feedback = ref({ type: '', message: '' })
const isSavingHotel = ref(false)
const form = reactive({ name: '', ruc: '', address: '', phone: '', email: '', plan: '' })

function keepDigits(value, maxLength) {
  return String(value ?? '').replace(/\D/g, '').slice(0, maxLength)
}

function updateRuc(value) {
  form.ruc = keepDigits(value, 11)
}

function updatePhone(value) {
  form.phone = keepDigits(value, 20)
}

watchEffect(() => {
  if (!operationsStore.activeHotel) return
  Object.assign(form, operationsStore.activeHotel)
})

async function saveHotel() {
  if (isSavingHotel.value) return
  isSavingHotel.value = true
  try {
    const result = await operationsStore.updateHotel({ name: form.name, ruc: form.ruc, address: form.address, phone: form.phone, email: form.email })
    feedback.value = { type: result.ok ? 'success' : 'error', message: result.message }
  } finally {
    isSavingHotel.value = false
  }
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
      <form class="form-grid" :aria-busy="isSavingHotel" @submit.prevent="saveHotel">
        <div class="form-field"><label>{{ t('admin.hotel.commercial-name') }} <span class="required-mark">*</span></label><pv-input-text v-model="form.name" :placeholder="t('admin.hotel.placeholders.name')" /></div>
        <div class="form-field"><label>{{ t('admin.hotel.ruc') }} <span class="required-mark">*</span></label><pv-input-text :model-value="form.ruc" :placeholder="t('admin.hotel.placeholders.ruc')" inputmode="numeric" maxlength="11" @update:model-value="updateRuc" /></div>
        <div class="form-field full"><label>{{ t('admin.hotel.address') }} <span class="required-mark">*</span></label><pv-input-text v-model="form.address" :placeholder="t('admin.hotel.placeholders.address')" /></div>
        <div class="form-field"><label>{{ t('admin.hotel.phone') }} <span class="required-mark">*</span></label><pv-input-text :model-value="form.phone" :placeholder="t('admin.hotel.placeholders.phone')" inputmode="numeric" maxlength="20" @update:model-value="updatePhone" /></div>
        <div class="form-field"><label>{{ t('admin.hotel.email') }} <span class="required-mark">*</span></label><pv-input-text v-model="form.email" :placeholder="t('admin.hotel.placeholders.email')" /></div>
        <div class="form-field"><label>{{ t('admin.hotel.plan') }}</label><input :value="form.plan" disabled /></div>
        <div class="form-field plan-button-field">
          <button class="secondary-button" type="button" @click="router.push({ name: 'admin-subscription' })"><i class="pi pi-credit-card"></i>{{ t('admin.hotel.manage-subscription') }}</button>
        </div>
        <div class="form-field full submit-field"><button class="primary-button" type="submit" :disabled="isSavingHotel"><i class="pi pi-save"></i>{{ t('admin.hotel.save-changes') }}</button></div>
      </form>
      <p v-if="feedback.message" class="feedback" :class="feedback.type">{{ resolveFeedbackMessage(feedback.message) }}</p>
    </section>
  </section>
</template>

<style scoped>
.submit-field {
  justify-content: end;
}

.plan-button-field { justify-content: end; }
</style>
