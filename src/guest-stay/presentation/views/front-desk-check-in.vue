<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import useGuestStaysStore from '../../application/guest-stays.store.js'
import { addHours, formatDateTime } from '../../../shared/domain/services/date-format.service.js'

const router = useRouter()
const { t } = useI18n()
const guestStaysStore = useGuestStaysStore()

const form = reactive({
  fullName: '',
  dni: '',
  phone: '',
  email: '',
  roomId: '',
  hours: 4,
  paymentMethod: 'cash',
  additionalGuestsQuantity: 0,
  additionalGuests: []
})
const errors = reactive({})
const feedback = ref({ type: '', message: '' })
const createdStay = ref(null)
const isSubmitting = ref(false)

const totalGuests = computed(() => 1 + Math.max(Number(form.additionalGuestsQuantity) || 0, 0))
const guestInformationComplete = computed(() =>
  /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s.'-]{3,80}$/.test(form.fullName.trim()) &&
  /^\d{8}$/.test(form.dni.trim()) &&
  /^\d{9}$/.test(form.phone.trim()) &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
)
const additionalGuestsComplete = computed(() => form.additionalGuests.every(guest =>
  /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s.'-]{3,80}$/.test(String(guest.fullName ?? '').trim()) &&
  /^\d{8}$/.test(String(guest.dni ?? '').trim())
))
const canSelectRoom = computed(() => {
  const stayHours = Number(form.hours)
  return guestInformationComplete.value && additionalGuestsComplete.value &&
    Number.isInteger(stayHours) && stayHours >= 1 && stayHours <= 168 &&
    Number.isInteger(totalGuests.value) && totalGuests.value >= 1 && totalGuests.value <= 99
})
const checkInAvailableRooms = computed(() => canSelectRoom.value ? guestStaysStore.getAvailableRoomsForCheckIn(form.hours, totalGuests.value) : [])
const selectedRoom = computed(() => guestStaysStore.getRoomById(form.roomId))
const checkoutLimit = computed(() => formatDateTime(addHours(new Date(), Number(form.hours) || 0)))
const initialAmount = computed(() => selectedRoom.value ? Number(form.hours) * Number(selectedRoom.value.pricePerHour) : 0)

watch(() => form.additionalGuestsQuantity, () => {
  const nextCount = Math.max(Number(form.additionalGuestsQuantity) || 0, 0)
  while (form.additionalGuests.length < nextCount) form.additionalGuests.push({ fullName: '', dni: '' })
  if (form.additionalGuests.length > nextCount) form.additionalGuests.splice(nextCount)
})

watch([canSelectRoom, totalGuests, () => form.hours], () => {
  if (!canSelectRoom.value) {
    form.roomId = ''
    return
  }
  if (!form.roomId) return
  const roomStillAvailable = checkInAvailableRooms.value.some(room => String(room.id) === String(form.roomId))
  if (!roomStillAvailable) form.roomId = ''
})

function sanitizeDigits(field, maxLength) {
  form[field] = String(form[field] ?? '').replace(/\D/g, '').slice(0, maxLength)
}

function sanitizeAdditionalGuestDni(index) {
  form.additionalGuests[index].dni = String(form.additionalGuests[index].dni ?? '').replace(/\D/g, '').slice(0, 8)
}

function setError(field, message) { errors[field] = message }
function clearErrors() { Object.keys(errors).forEach(key => delete errors[key]) }

function validateAdditionalGuests() {
  let valid = true
  form.additionalGuests.forEach((guest, index) => {
    if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s.'-]{3,80}$/.test(String(guest.fullName ?? '').trim())) {
      setError(`additionalGuestName${index}`, t('front-desk.check-in.validation.name'))
      valid = false
    }
    if (!/^\d{8}$/.test(String(guest.dni ?? '').trim())) {
      setError(`additionalGuestDni${index}`, t('front-desk.check-in.validation.dni'))
      valid = false
    }
  })
  return valid
}

function validate() {
  clearErrors()
  let valid = true
  if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s.'-]{3,80}$/.test(form.fullName.trim())) { setError('fullName', t('front-desk.check-in.validation.name')); valid = false }
  if (!/^\d{8}$/.test(form.dni.trim())) { setError('dni', t('front-desk.check-in.validation.dni')); valid = false }
  if (!/^\d{9}$/.test(form.phone.trim())) { setError('phone', t('front-desk.check-in.validation.phone')); valid = false }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) { setError('email', t('front-desk.check-in.validation.email')); valid = false }
  if (!Number.isInteger(Number(form.additionalGuestsQuantity)) || Number(form.additionalGuestsQuantity) < 0 || Number(form.additionalGuestsQuantity) > 98) { setError('additionalGuestsQuantity', t('front-desk.check-in.validation.guests-quantity')); valid = false }
  if (!validateAdditionalGuests()) valid = false
  if (!Number.isInteger(Number(form.hours)) || Number(form.hours) <= 0 || Number(form.hours) > 168) { setError('hours', t('front-desk.check-in.validation.hours')); valid = false }
  if (guestStaysStore.hasActiveStayByGuestDni(form.dni)) { setError('dni', t('front-desk.check-in.validation.guest-active-stay')); valid = false }
  if (!canSelectRoom.value) { setError('roomId', t('front-desk.check-in.validation.complete-data-before-room')); valid = false }
  else if (!form.roomId) { setError('roomId', t('front-desk.check-in.validation.room')); valid = false }
  if (valid) {
    const availability = guestStaysStore.validateCheckInAvailability({ roomId: form.roomId, hours: form.hours, guestsQuantity: totalGuests.value, dni: form.dni })
    if (!availability.valid) {
      setError('roomId', t(availability.message))
      valid = false
    }
  }
  return valid
}

function resetForm() {
  form.fullName = ''
  form.dni = ''
  form.phone = ''
  form.email = ''
  form.roomId = ''
  form.hours = 4
  form.paymentMethod = 'cash'
  form.additionalGuestsQuantity = 0
  form.additionalGuests.splice(0)
}

async function submitCheckIn() {
  if (isSubmitting.value) return
  feedback.value = { type: '', message: '' }
  createdStay.value = null
  if (!validate()) {
    feedback.value = { type: 'error', message: t('front-desk.check-in.validation.fix-fields') }
    return
  }

  isSubmitting.value = true
  try {
    const result = await guestStaysStore.createCheckIn({ ...form, guestsQuantity: totalGuests.value })
    feedback.value = { type: result.ok ? 'success' : 'error', message: result.message }
    if (result.ok) {
      createdStay.value = result.stay
      resetForm()
    }
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
      <div>
        <h1>{{ t('front-desk.check-in.title') }}</h1>
        <p>{{ t('front-desk.check-in.subtitle') }}</p>
      </div>
      <button class="secondary-button" type="button" @click="router.push({ name: 'front-desk-rooms' })">
        <i class="pi pi-building"></i>{{ t('front-desk.check-in.view-rooms') }}
      </button>
    </section>

    <form class="grid-two" :aria-busy="isSubmitting" @submit.prevent="submitCheckIn" novalidate>
      <section class="form-card">
        <div class="panel-header"><h2>{{ t('front-desk.check-in.guest-information') }}</h2></div>
        <div class="form-grid">
          <div class="form-field full">
            <label>{{ t('front-desk.check-in.name') }} <span class="required-symbol">*</span></label>
            <input v-model.trim="form.fullName" type="text" :placeholder="t('front-desk.check-in.name-placeholder')" />
            <p class="validation-message">{{ errors.fullName }}</p>
          </div>
          <div class="form-field">
            <label>{{ t('front-desk.check-in.dni') }} <span class="required-symbol">*</span></label>
            <input v-model="form.dni" type="text" inputmode="numeric" maxlength="8" :placeholder="t('front-desk.check-in.dni-placeholder')" @input="sanitizeDigits('dni', 8)" />
            <p class="validation-message">{{ errors.dni }}</p>
          </div>
          <div class="form-field">
            <label>{{ t('front-desk.check-in.phone') }} <span class="required-symbol">*</span></label>
            <input v-model="form.phone" type="text" inputmode="numeric" maxlength="9" :placeholder="t('front-desk.check-in.phone-placeholder')" @input="sanitizeDigits('phone', 9)" />
            <p class="validation-message">{{ errors.phone }}</p>
          </div>
          <div class="form-field full">
            <label>{{ t('front-desk.check-in.email') }} <span class="required-symbol">*</span></label>
            <input v-model.trim="form.email" type="email" :placeholder="t('front-desk.check-in.email-placeholder')" />
            <p class="validation-message">{{ errors.email }}</p>
          </div>
        </div>

        <div class="additional-guests-section">
          <h2>{{ t('front-desk.check-in.additional-guests') }}</h2>
          <div class="form-field">
            <label>{{ t('front-desk.check-in.additional-guests-quantity') }} <span class="required-symbol">*</span></label>
            <input v-model.number="form.additionalGuestsQuantity" type="number" min="0" max="98" />
            <p class="validation-message">{{ errors.additionalGuestsQuantity }}</p>
          </div>
          <article v-for="(guest, index) in form.additionalGuests" :key="index" class="additional-guest-card">
            <strong>{{ t('front-desk.check-in.additional-guest-number', { number: index + 1 }) }}</strong>
            <div class="form-grid">
              <div class="form-field">
                <label>{{ t('front-desk.check-in.name') }} <span class="required-symbol">*</span></label>
                <input v-model.trim="guest.fullName" type="text" :placeholder="t('front-desk.check-in.name-placeholder')" />
                <p class="validation-message">{{ errors[`additionalGuestName${index}`] }}</p>
              </div>
              <div class="form-field">
                <label>{{ t('front-desk.check-in.dni') }} <span class="required-symbol">*</span></label>
                <input v-model="guest.dni" type="text" maxlength="8" inputmode="numeric" :placeholder="t('front-desk.check-in.dni-placeholder')" @input="sanitizeAdditionalGuestDni(index)" />
                <p class="validation-message">{{ errors[`additionalGuestDni${index}`] }}</p>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section class="form-card">
        <div class="panel-header"><h2>{{ t('front-desk.check-in.stay-details') }}</h2></div>
        <div class="form-grid">
          <div class="form-field">
            <label>{{ t('front-desk.check-in.hours') }} <span class="required-symbol">*</span></label>
            <input v-model.number="form.hours" type="number" min="1" max="168" />
            <p class="validation-message">{{ errors.hours }}</p>
          </div>
          <div class="form-field">
            <label>{{ t('front-desk.check-in.payment-method') }} <span class="required-symbol">*</span></label>
            <select v-model="form.paymentMethod">
              <option value="cash">{{ t('front-desk.checkout.cash') }}</option>
              <option value="card">{{ t('front-desk.checkout.card') }}</option>
              <option value="transfer">{{ t('front-desk.checkout.transfer') }}</option>
              <option value="yape">{{ t('front-desk.checkout.yape') }}</option>
            </select>
          </div>
          <div class="form-field full">
            <label>{{ t('front-desk.check-in.room') }} <span class="required-symbol">*</span></label>
            <select v-model="form.roomId" :disabled="!canSelectRoom">
              <option value="">{{ t('front-desk.check-in.select-room') }}</option>
              <option v-for="room in checkInAvailableRooms" :key="room.id" :value="room.id">
                {{ t('front-desk.common.room-abbr') }} {{ room.number }} · {{ t('front-desk.rooms.floor-with-number', { floor: room.floor }) }} · {{ t('front-desk.reservation-form.capacity', { capacity: room.capacity }) }} · S/ {{ Number(room.pricePerHour).toFixed(2) }}/h
              </option>
            </select>
            <p class="help-message" v-if="!canSelectRoom">{{ t('front-desk.check-in.validation.complete-data-before-room') }}</p>
            <p class="validation-message">{{ errors.roomId }}</p>
          </div>
        </div>

        <div class="panel-card check-in-summary-card">
          <h3>{{ t('front-desk.check-in.summary') }}</h3>
          <p><strong>{{ t('front-desk.check-in.price-per-hour') }}:</strong> S/ {{ selectedRoom ? Number(selectedRoom.pricePerHour).toFixed(2) : '0.00' }}</p>
          <p><strong>{{ t('front-desk.check-in.checkout-limit') }}:</strong> {{ checkoutLimit }}</p>
          <p><strong>{{ t('front-desk.check-in.initial-amount') }}:</strong> S/ {{ initialAmount.toFixed(2) }}</p>
        </div>

        <p v-if="feedback.message" class="feedback" :class="feedback.type">{{ resolveFeedbackMessage(feedback.message) }}</p>
        <button class="primary-button check-in-submit-button" type="submit" :disabled="isSubmitting"><i class="pi pi-check"></i>{{ t('front-desk.check-in.submit') }}</button>
      </section>
    </form>

    <section v-if="createdStay" class="panel-card">
      <div class="panel-header"><h2>{{ t('front-desk.check-in.created-title') }}</h2></div>
      <p>{{ t('front-desk.check-in.created-message', { room: createdStay.room?.number, checkout: createdStay.formattedCheckOut }) }}</p>
      <p>{{ t('front-desk.check-in.initial-total') }}: <strong>S/ {{ createdStay.initialAmount.toFixed(2) }}</strong></p>
      <button class="secondary-button" type="button" @click="router.push({ name: 'front-desk-stays' })">{{ t('front-desk.check-in.view-stays') }}</button>
    </section>
  </section>
</template>

<style scoped>
.check-in-summary-card { margin-top: 1rem; box-shadow: none; }
.check-in-submit-button { width: 100%; margin-top: 1rem; }
.additional-guests-section { margin-top: 1rem; display: grid; gap: 0.8rem; }
.additional-guests-section h2 { margin: 0; color: #1e3a8a; font-size: 1.05rem; }
.additional-guest-card { padding: 0.9rem; border: 1px solid #dbeafe; border-radius: 16px; background: #f8fbff; }
.additional-guest-card strong { display: block; margin-bottom: 0.6rem; color: #1e3a8a; }
</style>
