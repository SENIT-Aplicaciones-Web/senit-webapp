<script setup>
import { computed, reactive, ref, watch } from 'vue'
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
const isSubmitting = ref(false)

function toDateInputValue(date) {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return localDate.toISOString().slice(0, 10)
}

const todayDate = computed(() => toDateInputValue(new Date()))
const startAt = computed(() => form.startDate && form.startTime ? `${form.startDate}T${form.startTime}:00` : '')
const endAt = computed(() => form.endDate && form.endTime ? `${form.endDate}T${form.endTime}:00` : '')
const availableRoomsForSchedule = computed(() => reservationsStore.getReservationAvailableRooms({ startAt: startAt.value, endAt: endAt.value }))
const selectedRoom = computed(() => reservationsStore.rooms.find(room => String(room.id) === String(form.roomId)) ?? null)
const selectedRoomCapacity = computed(() => Number(selectedRoom.value?.capacity ?? 0))
const reservationHours = computed(() => {
  if (!startAt.value || !endAt.value) return 0
  const start = new Date(startAt.value).getTime()
  const end = new Date(endAt.value).getTime()
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return 0
  const hours = (end - start) / (60 * 60 * 1000)
  return Number.isInteger(hours) ? hours : 0
})
const reservationAmount = computed(() => Number((reservationHours.value * Number(selectedRoom.value?.pricePerHour ?? 0)).toFixed(2)))

watch([startAt, endAt, () => form.roomId], () => {
  if (!form.roomId) return
  const roomStillAvailable = availableRoomsForSchedule.value.some(room => String(room.id) === String(form.roomId))
  if (!roomStillAvailable) form.roomId = ''
})

function goBackToReservations() {
  router.push({ name: route.path.startsWith('/admin') ? 'admin-reservations' : 'front-desk-reservations' })
}

function sanitizeDigits(field, maxLength) {
  form[field] = String(form[field] ?? '').replace(/\D/g, '').slice(0, maxLength)
}

function setError(field, message) { errors[field] = message }
function clearErrors() { Object.keys(errors).forEach(key => delete errors[key]) }
function validate() {
  clearErrors()
  let valid = true
  const guestName = form.guestName.trim()
  const email = form.email.trim()
  const guestsQuantity = Number(form.guestsQuantity)

  if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s.'-]{3,80}$/.test(guestName)) { setError('guestName', t('front-desk.validation.valid-guest-name')); valid = false }
  if (!/^\d{8}$/.test(form.dni.trim())) { setError('dni', t('front-desk.validation.valid-dni')); valid = false }
  if (!/^\d{9}$/.test(form.phone.trim())) { setError('phone', t('front-desk.validation.valid-phone')); valid = false }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('email', t('front-desk.validation.valid-email')); valid = false }
  if (!form.roomId) { setError('roomId', t('front-desk.reservation-form.select-room')); valid = false }
  if (!Number.isInteger(guestsQuantity) || guestsQuantity < 1) { setError('guestsQuantity', t('front-desk.validation.valid-guests-quantity')); valid = false }
  if (selectedRoomCapacity.value && guestsQuantity > selectedRoomCapacity.value) { setError('guestsQuantity', t('front-desk.validation.guests-exceed-capacity', { capacity: selectedRoomCapacity.value })); valid = false }
  if (!form.startDate || !form.startTime) { setError('startAt', t('front-desk.reservation-form.start-date')); valid = false }
  if (!form.endDate || !form.endTime) { setError('endAt', t('front-desk.reservation-form.end-date')); valid = false }

  if (form.startDate && form.startTime && new Date(startAt.value).getTime() < Date.now()) {
    setError('startAt', t('front-desk.validation.start-in-past'))
    valid = false
  }

  if (valid) {
    const availability = reservationsStore.validateReservationAvailability({ roomId: form.roomId, startAt: startAt.value, endAt: endAt.value })
    if (!availability.valid) { setError('roomId', t(availability.message)); valid = false }
  }
  return valid
}
async function submitReservation() {
  if (isSubmitting.value) return
  feedback.value = { type: '', message: '' }
  if (!validate()) {
    feedback.value = { type: 'error', message: t('front-desk.check-in.validation.fix-fields') }
    return
  }
  isSubmitting.value = true
  try {
    const result = await reservationsStore.createReservation({ ...form, startAt: startAt.value, endAt: endAt.value })
    feedback.value = { type: result.ok ? 'success' : 'error', message: result.message }
    if (result.ok) window.setTimeout(goBackToReservations, 1400)
  } finally {
    isSubmitting.value = false
  }
}

function resolveFeedbackMessage(message) {
  return /^[a-z0-9.-]+$/.test(message ?? '') ? t(message) : message
}
</script>

<template>
  <section class="page-shell">
    <section class="page-header">
      <div><h1>{{ t('front-desk.reservation-form.title') }}</h1><p>{{ t('front-desk.reservation-form.subtitle') }}</p></div>
      <button class="secondary-button" type="button" @click="goBackToReservations"><i class="pi pi-arrow-left"></i>{{ t('shared.actions.back') }}</button>
    </section>

    <form class="grid-two reservation-form-layout" :aria-busy="isSubmitting" @submit.prevent="submitReservation" novalidate>
      <section class="form-card">
        <div class="panel-header"><h2>{{ t('front-desk.reservation-form.owner-data') }}</h2></div>
        <div class="form-grid">
          <div class="form-field full">
            <label for="guestName">{{ t('front-desk.reservation-form.guest-name') }}</label>
            <input id="guestName" v-model.trim="form.guestName" type="text" :aria-invalid="Boolean(errors.guestName)" :placeholder="t('front-desk.reservation-form.placeholders.guest-name')" />
            <p class="validation-message">{{ errors.guestName }}</p>
          </div>
          <div class="form-field">
            <label for="dni">{{ t('front-desk.reservation-form.dni') }}</label>
            <input id="dni" v-model="form.dni" maxlength="8" inputmode="numeric" :aria-invalid="Boolean(errors.dni)" :placeholder="t('front-desk.reservation-form.placeholders.dni')" @input="sanitizeDigits('dni', 8)" />
            <p class="validation-message">{{ errors.dni }}</p>
          </div>
          <div class="form-field">
            <label for="phone">{{ t('front-desk.reservation-form.phone') }}</label>
            <input id="phone" v-model="form.phone" maxlength="9" inputmode="numeric" :aria-invalid="Boolean(errors.phone)" :placeholder="t('front-desk.reservation-form.placeholders.phone')" @input="sanitizeDigits('phone', 9)" />
            <p class="validation-message">{{ errors.phone }}</p>
          </div>
          <div class="form-field full">
            <label for="email">{{ t('front-desk.reservation-form.email') }}</label>
            <input id="email" v-model.trim="form.email" type="email" :aria-invalid="Boolean(errors.email)" :placeholder="t('front-desk.reservation-form.placeholders.email')" />
            <p class="validation-message">{{ errors.email }}</p>
          </div>
        </div>
      </section>

      <section class="form-card">
        <div class="panel-header"><h2>{{ t('front-desk.reservation-form.reservation-data') }}</h2></div>
        <div class="form-grid">
          <div class="form-field full">
            <label for="roomId">{{ t('front-desk.reservation-form.room') }}</label>
            <select id="roomId" v-model="form.roomId" :aria-invalid="Boolean(errors.roomId)">
              <option value="">{{ t('front-desk.reservation-form.select-room') }}</option>
              <option v-for="room in availableRoomsForSchedule" :key="room.id" :value="room.id">
                {{ t('front-desk.common.room-abbr') }} {{ room.number }} · {{ room.type }} · {{ reservationsStore.getRoomStatusLabel(room.status) }} · {{ t('front-desk.reservation-form.capacity', { capacity: room.capacity }) }}
              </option>
            </select>
            <p class="validation-message">{{ errors.roomId }}</p>
          </div>
          <div class="form-field">
            <label for="guestsQuantity">{{ t('front-desk.reservation-form.guests-quantity') }}</label>
            <input id="guestsQuantity" v-model.number="form.guestsQuantity" min="1" :max="selectedRoomCapacity || undefined" type="number" :aria-invalid="Boolean(errors.guestsQuantity)" :placeholder="t('front-desk.reservation-form.placeholders.guests-quantity')" />
            <p class="validation-message">{{ errors.guestsQuantity }}</p>
          </div>
          <div class="form-field"><label for="startDate">{{ t('front-desk.reservation-form.start-date') }}</label><input id="startDate" v-model="form.startDate" type="date" :min="todayDate" :aria-invalid="Boolean(errors.startAt)" /><p class="validation-message">{{ errors.startAt }}</p></div>
          <div class="form-field"><label for="startTime">{{ t('front-desk.reservation-form.start-time') }}</label><input id="startTime" v-model="form.startTime" type="time" /></div>
          <div class="form-field"><label for="endDate">{{ t('front-desk.reservation-form.end-date') }}</label><input id="endDate" v-model="form.endDate" type="date" :min="form.startDate || todayDate" :aria-invalid="Boolean(errors.endAt)" /><p class="validation-message">{{ errors.endAt }}</p></div>
          <div class="form-field"><label for="endTime">{{ t('front-desk.reservation-form.end-time') }}</label><input id="endTime" v-model="form.endTime" type="time" /></div>
        </div>

        <div class="reservation-payment-box">
          <h3>{{ t('front-desk.reservation-form.guarantee-payment') }}</h3>
          <p>{{ t('front-desk.reservation-form.guarantee-help') }}</p>
          <div class="form-grid">
            <div class="form-field">
              <label for="paymentMethod">{{ t('front-desk.checkout.payment-method') }}</label>
              <select id="paymentMethod" v-model="form.paymentMethod">
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
        <div class="actions-row reservation-actions">
          <button class="primary-button" type="submit" :disabled="isSubmitting"><i class="pi pi-check"></i>{{ t('front-desk.reservation-form.create') }}</button>
          <button class="ghost-button" type="button" :disabled="isSubmitting" @click="goBackToReservations">{{ t('front-desk.reservation-form.cancel') }}</button>
        </div>
      </section>
    </form>
  </section>
</template>

<style scoped>
.reservation-actions {
  margin-top: 1rem;
}

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
