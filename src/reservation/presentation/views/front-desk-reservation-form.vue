<script setup>
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import useReservationsStore from '../../application/reservations.store.js'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const reservationsStore = useReservationsStore()

const form = reactive({
  guestName: '',
  dni: '',
  phone: '',
  email: '',
  roomId: '',
  guestsQuantity: 1,
  startDate: '',
  startTime: '',
  endDate: '',
  endTime: '',
  paymentMethod: 'cash'
})
const errors = reactive({})
const feedback = ref({ type: '', message: '' })

const startAt = computed(() => form.startDate && form.startTime ? `${form.startDate}T${form.startTime}:00` : '')
const endAt = computed(() => form.endDate && form.endTime ? `${form.endDate}T${form.endTime}:00` : '')
const selectedRoom = computed(() => reservationsStore.rooms.find(room => String(room.id) === String(form.roomId)) ?? null)
const reservationHours = computed(() => {
  if (!startAt.value || !endAt.value) return 0
  const start = new Date(startAt.value).getTime()
  const end = new Date(endAt.value).getTime()
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return 0
  const hours = (end - start) / (60 * 60 * 1000)
  return Number.isInteger(hours) ? hours : 0
})
const reservationAmount = computed(() => Number((reservationHours.value * Number(selectedRoom.value?.pricePerHour ?? 0)).toFixed(2)))

function setError(field, message) { errors[field] = message }
function clearErrors() { Object.keys(errors).forEach(key => delete errors[key]) }
function validate() {
  clearErrors()
  let valid = true
  if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s.'-]{3,80}$/.test(form.guestName.trim())) { setError('guestName', t('front-desk.check-in.validation.name')); valid = false }
  if (!/^\d{8}$/.test(form.dni.trim())) { setError('dni', t('front-desk.check-in.validation.dni')); valid = false }
  if (!/^\d{9}$/.test(form.phone.trim())) { setError('phone', t('front-desk.check-in.validation.phone')); valid = false }
  if (!form.email.includes('@')) { setError('email', t('front-desk.check-in.validation.email')); valid = false }
  if (!form.roomId) { setError('roomId', t('front-desk.reservation-form.select-room')); valid = false }
  if (!form.startDate || !form.startTime) { setError('startAt', t('front-desk.reservation-form.start-date')); valid = false }
  if (!form.endDate || !form.endTime) { setError('endAt', t('front-desk.reservation-form.end-date')); valid = false }
  if (valid) {
    const availability = reservationsStore.validateReservationAvailability({ roomId: form.roomId, startAt: startAt.value, endAt: endAt.value })
    if (!availability.valid) { setError('roomId', availability.message); valid = false }
  }
  return valid
}
async function submitReservation() {
  feedback.value = { type: '', message: '' }
  if (!validate()) {
    feedback.value = { type: 'error', message: t('front-desk.check-in.validation.fix-fields') }
    return
  }
  const result = await reservationsStore.createReservation({ ...form, startAt: startAt.value, endAt: endAt.value })
  feedback.value = { type: result.ok ? 'success' : 'error', message: result.message }
  if (result.ok) setTimeout(() => router.push({ name: route.path.startsWith('/admin') ? 'admin-reservations' : 'front-desk-reservations' }), 700)
}

function resolveFeedbackMessage(message) {
  return /^[a-z0-9.-]+$/.test(message ?? '') ? t(message) : message
}
</script>

<template>
  <section class="page-shell">
    <section class="page-header">
      <div><h1>{{ t('front-desk.reservation-form.title') }}</h1><p>{{ t('front-desk.reservation-form.subtitle') }}</p></div>
      <button class="secondary-button" type="button" @click="router.push({ name: route.path.startsWith('/admin') ? 'admin-reservations' : 'front-desk-reservations' })"><i class="pi pi-arrow-left"></i>{{ t('shared.actions.back') }}</button>
    </section>

    <form class="grid-two reservation-form-layout" @submit.prevent="submitReservation" novalidate>
      <section class="form-card">
        <div class="panel-header"><h2>{{ t('front-desk.reservation-form.owner-data') }}</h2></div>
        <div class="form-grid">
          <div class="form-field full"><label>{{ t('front-desk.reservation-form.guest-name') }}</label><input v-model="form.guestName" type="text" :placeholder="t('front-desk.reservation-form.placeholders.guest-name')" /><p class="validation-message">{{ errors.guestName }}</p></div>
          <div class="form-field"><label>{{ t('front-desk.reservation-form.dni') }}</label><input v-model="form.dni" maxlength="8" inputmode="numeric" :placeholder="t('front-desk.reservation-form.placeholders.dni')" /><p class="validation-message">{{ errors.dni }}</p></div>
          <div class="form-field"><label>{{ t('front-desk.reservation-form.phone') }}</label><input v-model="form.phone" maxlength="20" inputmode="numeric" :placeholder="t('front-desk.reservation-form.placeholders.phone')" /><p class="validation-message">{{ errors.phone }}</p></div>
          <div class="form-field full"><label>{{ t('front-desk.reservation-form.email') }}</label><input v-model="form.email" type="text" :placeholder="t('front-desk.reservation-form.placeholders.email')" /><p class="validation-message">{{ errors.email }}</p></div>
        </div>
      </section>

      <section class="form-card">
        <div class="panel-header"><h2>{{ t('front-desk.reservation-form.reservation-data') }}</h2></div>
        <div class="form-grid">
          <div class="form-field full"><label>{{ t('front-desk.reservation-form.room') }}</label><select v-model="form.roomId"><option value="">{{ t('front-desk.reservation-form.select-room') }}</option><option v-for="room in reservationsStore.rooms" :key="room.id" :value="room.id">{{ t('front-desk.common.room-abbr') }} {{ room.number }} · {{ room.type }} · {{ reservationsStore.getRoomStatusLabel(room.status) }}</option></select><p class="validation-message">{{ errors.roomId }}</p></div>
          <div class="form-field"><label>{{ t('front-desk.reservation-form.guests-quantity') }}</label><input v-model.number="form.guestsQuantity" min="1" type="number" :placeholder="t('front-desk.reservation-form.placeholders.guests-quantity')" /></div>
          <div class="form-field"><label>{{ t('front-desk.reservation-form.start-date') }}</label><input v-model="form.startDate" type="date" /><p class="validation-message">{{ errors.startAt }}</p></div>
          <div class="form-field"><label>{{ t('front-desk.reservation-form.start-time') }}</label><input v-model="form.startTime" type="time" /></div>
          <div class="form-field"><label>{{ t('front-desk.reservation-form.end-date') }}</label><input v-model="form.endDate" type="date" /><p class="validation-message">{{ errors.endAt }}</p></div>
          <div class="form-field"><label>{{ t('front-desk.reservation-form.end-time') }}</label><input v-model="form.endTime" type="time" /></div>
        </div>

        <div class="reservation-payment-box">
          <h3>{{ t('front-desk.reservation-form.guarantee-payment') }}</h3>
          <p>{{ t('front-desk.reservation-form.guarantee-help') }}</p>
          <div class="form-grid">
            <div class="form-field">
              <label>{{ t('front-desk.checkout.payment-method') }}</label>
              <select v-model="form.paymentMethod">
                <option value="cash">{{ t('front-desk.checkout.cash') }}</option>
                <option value="card">{{ t('front-desk.checkout.card') }}</option>
                <option value="transfer">{{ t('front-desk.checkout.transfer') }}</option>
                <option value="yape">{{ t('front-desk.checkout.yape') }}</option>
              </select>
            </div>
            <div class="reservation-amount-card">
              <span>{{ t('front-desk.reservation-form.amount-to-pay') }}</span>
              <strong>S/ {{ reservationAmount.toFixed(2) }}</strong>
              <small>{{ reservationHours }} {{ t('shared.states.hours') }}</small>
            </div>
          </div>
        </div>
        <p v-if="feedback.message" class="feedback" :class="feedback.type">{{ resolveFeedbackMessage(feedback.message) }}</p>
        <div class="actions-row" style="margin-top: 1rem;"><button class="primary-button" type="submit"><i class="pi pi-check"></i>{{ t('front-desk.reservation-form.create') }}</button><button class="ghost-button" type="button" @click="router.push({ name: route.path.startsWith('/admin') ? 'admin-reservations' : 'front-desk-reservations' })">{{ t('front-desk.reservation-form.cancel') }}</button></div>
      </section>
    </form>
  </section>
</template>


<style scoped>
.reservation-payment-box {
  margin-top: 1.1rem;
  padding: 1rem;
  border: 1px solid #dbeafe;
  border-radius: 16px;
  background: #f8fbff;
}

.reservation-payment-box h3 {
  margin: 0 0 0.35rem;
  color: #1e3a8a;
  font-size: 1.05rem;
  font-weight: 650;
}

.reservation-payment-box p {
  margin: 0 0 0.85rem;
  color: #64748b;
  font-size: 0.9rem;
}

.reservation-amount-card {
  min-height: 46px;
  display: grid;
  gap: 0.12rem;
  padding: 0.75rem 0.9rem;
  border: 1px solid #dbe3ef;
  border-radius: 14px;
  background: #ffffff;
}

.reservation-amount-card span,
.reservation-amount-card small {
  color: #64748b;
  font-size: 0.78rem;
}

.reservation-amount-card strong {
  color: #1e3a8a;
  font-size: 1.25rem;
  font-weight: 700;
}
</style>
