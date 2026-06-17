<script setup>
import { computed, reactive, ref } from 'vue'
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
  paymentMethod: 'cash'
})
const errors = reactive({})
const feedback = ref({ type: '', message: '' })
const createdStay = ref(null)

const selectedRoom = computed(() => guestStaysStore.getRoomById(form.roomId))
const checkoutLimit = computed(() => formatDateTime(addHours(new Date(), form.hours)))
const initialAmount = computed(() => selectedRoom.value ? Number(form.hours) * Number(selectedRoom.value.pricePerHour) : 0)

function setError(field, message) {
  errors[field] = message
}

function clearErrors() {
  Object.keys(errors).forEach(key => delete errors[key])
}

function validate() {
  clearErrors()
  let valid = true
  if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s.'-]{3,80}$/.test(form.fullName.trim())) {
    setError('fullName', t('front-desk.check-in.validation.name'))
    valid = false
  }
  if (!/^\d{8}$/.test(form.dni.trim())) {
    setError('dni', t('front-desk.check-in.validation.dni'))
    valid = false
  }
  if (!/^\d{9}$/.test(form.phone.trim())) {
    setError('phone', t('front-desk.check-in.validation.phone'))
    valid = false
  }
  if (!form.email.includes('@')) {
    setError('email', t('front-desk.check-in.validation.email'))
    valid = false
  }
  if (!form.roomId) {
    setError('roomId', t('front-desk.check-in.validation.room'))
    valid = false
  }
  if (!form.hours || Number(form.hours) <= 0) {
    setError('hours', t('front-desk.check-in.validation.hours'))
    valid = false
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
}

function submitCheckIn() {
  feedback.value = { type: '', message: '' }
  createdStay.value = null
  if (!validate()) {
    feedback.value = { type: 'error', message: t('front-desk.check-in.validation.fix-fields') }
    return
  }

  const result = guestStaysStore.createCheckIn(form)
  feedback.value = { type: result.ok ? 'success' : 'error', message: result.message }
  if (result.ok) {
    createdStay.value = result.stay
    resetForm()
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

    <form class="grid-two" @submit.prevent="submitCheckIn" novalidate>
      <section class="form-card">
        <div class="panel-header"><h2>{{ t('front-desk.check-in.guest-information') }}</h2></div>
        <div class="form-grid">
          <div class="form-field full">
            <label>{{ t('front-desk.check-in.name') }}</label>
            <input v-model="form.fullName" type="text" :placeholder="t('front-desk.check-in.name-placeholder')" />
            <p class="validation-message">{{ errors.fullName }}</p>
          </div>
          <div class="form-field">
            <label>{{ t('front-desk.check-in.dni') }}</label>
            <input v-model="form.dni" type="text" inputmode="numeric" maxlength="8" :placeholder="t('front-desk.check-in.dni-placeholder')" />
            <p class="validation-message">{{ errors.dni }}</p>
          </div>
          <div class="form-field">
            <label>{{ t('front-desk.check-in.phone') }}</label>
            <input v-model="form.phone" type="text" inputmode="numeric" maxlength="9" :placeholder="t('front-desk.check-in.phone-placeholder')" />
            <p class="validation-message">{{ errors.phone }}</p>
          </div>
          <div class="form-field full">
            <label>{{ t('front-desk.check-in.email') }}</label>
            <input v-model="form.email" type="text" :placeholder="t('front-desk.check-in.email-placeholder')" />
            <p class="validation-message">{{ errors.email }}</p>
          </div>
        </div>
      </section>

      <section class="form-card">
        <div class="panel-header"><h2>{{ t('front-desk.check-in.stay-details') }}</h2></div>
        <div class="form-grid">
          <div class="form-field full">
            <label>{{ t('front-desk.check-in.room') }}</label>
            <select v-model="form.roomId">
              <option value="">{{ t('front-desk.check-in.select-room') }}</option>
              <option v-for="room in guestStaysStore.availableRooms" :key="room.id" :value="room.id">
                {{ t('front-desk.common.room-abbr') }} {{ room.number }} · {{ room.type }} · S/ {{ room.pricePerHour.toFixed(2) }}/h
              </option>
            </select>
            <p class="validation-message">{{ errors.roomId }}</p>
          </div>
          <div class="form-field">
            <label>{{ t('front-desk.check-in.hours') }}</label>
            <input v-model.number="form.hours" type="number" min="1" max="168" />
            <p class="validation-message">{{ errors.hours }}</p>
          </div>
          <div class="form-field">
            <label>{{ t('front-desk.check-in.payment-method') }}</label>
            <select v-model="form.paymentMethod">
              <option value="cash">{{ t('front-desk.checkout.cash') }}</option>
              <option value="card">{{ t('front-desk.checkout.card') }}</option>
              <option value="transfer">{{ t('front-desk.checkout.transfer') }}</option>
              <option value="yape">{{ t('front-desk.checkout.yape') }}</option>
            </select>
          </div>
        </div>

        <div class="panel-card" style="margin-top: 1rem; box-shadow:none;">
          <h3>{{ t('front-desk.check-in.summary') }}</h3>
          <p><strong>{{ t('front-desk.check-in.price-per-hour') }}:</strong> S/ {{ selectedRoom ? selectedRoom.pricePerHour.toFixed(2) : '0.00' }}</p>
          <p><strong>{{ t('front-desk.check-in.checkout-limit') }}:</strong> {{ checkoutLimit }}</p>
          <p><strong>{{ t('front-desk.check-in.initial-amount') }}:</strong> S/ {{ initialAmount.toFixed(2) }}</p>
        </div>

        <p v-if="feedback.message" class="feedback" :class="feedback.type">{{ resolveFeedbackMessage(feedback.message) }}</p>
        <button class="primary-button" type="submit" style="width: 100%; margin-top: 1rem;"><i class="pi pi-check"></i>{{ t('front-desk.check-in.submit') }}</button>
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
