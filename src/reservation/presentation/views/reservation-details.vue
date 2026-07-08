<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { toI18nKey } from '../../../shared/application/locale-key.js'
import { formatDate, formatTime } from '../../../shared/domain/services/date-format.service.js'
import useReservationsStore from '../../application/reservations.store.js'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const reservationsStore = useReservationsStore()
const feedback = ref({ type: '', message: '' })
const isCancelling = ref(false)

const reservation = computed(() => reservationsStore.getReservationById(route.params.id))
const room = computed(() => reservation.value?.room ?? null)
const registeredGuests = computed(() => {
  if (!reservation.value) return []
  const titular = {
    fullName: reservation.value.guestName,
    dni: reservation.value.dni,
    type: t('front-desk.reservation-details.main-guest')
  }
  const additional = Array.isArray(reservation.value.additionalGuests)
    ? reservation.value.additionalGuests.map(guest => ({
        fullName: guest.fullName,
        dni: guest.dni,
        type: t('front-desk.reservation-details.additional-guest')
      }))
    : []
  return [titular, ...additional]
})

function goBack() {
  router.push({ name: route.path.startsWith('/admin') ? 'admin-reservations' : 'front-desk-reservations' })
}

async function cancelReservation() {
  if (!reservation.value || !reservation.value.canCancel || isCancelling.value) return
  isCancelling.value = true
  try {
    const result = await reservationsStore.cancelReservation(reservation.value.id)
    feedback.value = { type: result.ok ? 'success' : 'error', message: result.message }
    if (result.ok) goBack()
  } finally {
    isCancelling.value = false
  }
}

function resolveFeedbackMessage(message) {
  return /^[a-z0-9.-]+$/.test(message ?? '') ? t(message) : message
}
</script>

<template>
  <section class="page-shell reservation-details-page">
    <section class="page-header">
      <div>
        <h1>{{ t('front-desk.reservation-details.title') }}</h1>
        <p>{{ t('front-desk.reservation-details.subtitle') }}</p>
      </div>
    </section>

    <p v-if="feedback.message" class="feedback" :class="feedback.type">{{ resolveFeedbackMessage(feedback.message) }}</p>

    <section v-if="reservation" class="panel-card reservation-details-card">
      <div class="detail-grid">
        <article class="detail-item"><span>{{ t('front-desk.reservations.name') }}</span><strong>{{ reservation.guestName }}</strong></article>
        <article class="detail-item"><span>{{ t('front-desk.reservations.room') }}</span><strong>{{ room?.number ?? '-' }}</strong></article>
        <article class="detail-item"><span>{{ t('front-desk.reservations.location') }}</span><strong>{{ t('front-desk.rooms.floor-with-number', { floor: room?.floor ?? '-' }) }}</strong></article>
        <article class="detail-item"><span>{{ t('front-desk.reservations.start-date') }}</span><strong>{{ formatDate(reservation.startAt) }}</strong></article>
        <article class="detail-item"><span>{{ t('front-desk.reservations.start-time') }}</span><strong>{{ formatTime(reservation.startAt) }}</strong></article>
        <article class="detail-item"><span>{{ t('front-desk.reservations.end-date') }}</span><strong>{{ formatDate(reservation.endAt) }}</strong></article>
        <article class="detail-item"><span>{{ t('front-desk.reservations.end-time') }}</span><strong>{{ formatTime(reservation.endAt) }}</strong></article>
        <article class="detail-item"><span>{{ t('front-desk.reservations.status') }}</span><strong>{{ t('front-desk.reservation-status.' + toI18nKey(reservation.runtimeStatus)) }}</strong></article>
        <article class="detail-item"><span>{{ t('front-desk.reservation-details.payment-method') }}</span><strong>{{ t('front-desk.payment-methods.' + (reservation.paymentMethod ?? 'cash')) }}</strong></article>
        <article class="detail-item"><span>{{ t('front-desk.reservation-details.amount') }}</span><strong>S/ {{ Number(reservation.reservationAmount ?? reservation.prepaidAmount ?? 0).toFixed(2) }}</strong></article>
        <article class="detail-item"><span>{{ t('front-desk.reservation-details.guests-quantity') }}</span><strong>{{ reservation.guestsQuantity }}</strong></article>
        <article class="detail-item"><span>{{ t('front-desk.reservation-details.registered-guests') }}</span><strong>{{ registeredGuests.length }}</strong></article>
      </div>

      <section class="registered-guests-panel">
        <h2>{{ t('front-desk.reservation-details.registered-guests') }}</h2>
        <div class="guest-list">
          <article v-for="guest in registeredGuests" :key="`${guest.dni}-${guest.type}`" class="guest-card">
            <span>{{ guest.type }}</span>
            <strong>{{ guest.fullName }}</strong>
            <small>{{ t('front-desk.check-in.dni') }}: {{ guest.dni }}</small>
          </article>
        </div>
      </section>

      <div class="actions-row details-actions">
        <button class="secondary-button" type="button" @click="goBack"><i class="pi pi-arrow-left"></i>{{ t('shared.actions.back') }}</button>
        <button
          v-if="reservation.canCancel"
          class="danger-ghost-button"
          type="button"
          :disabled="isCancelling"
          @click="cancelReservation">
          <i class="pi pi-times"></i>{{ t('front-desk.reservations.cancel') }}
        </button>
      </div>
    </section>

    <section v-else class="empty-state panel-card">
      <i class="pi pi-search"></i>
      <h2>{{ t('front-desk.reservations.not-found') }}</h2>
      <button class="secondary-button" type="button" @click="goBack">{{ t('shared.actions.back') }}</button>
    </section>
  </section>
</template>

<style scoped>
.reservation-details-page {
  display: grid;
  gap: 1rem;
}

.reservation-details-card {
  display: grid;
  gap: 1.25rem;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.9rem;
}

.detail-item,
.guest-card {
  display: grid;
  gap: 0.3rem;
  padding: 0.9rem;
  border: 1px solid #dbe3ef;
  border-radius: 14px;
  background: #f8fbff;
}

.detail-item span,
.guest-card span,
.guest-card small {
  color: #64748b;
  font-size: 0.82rem;
}

.detail-item strong,
.guest-card strong {
  color: #0f172a;
}

.registered-guests-panel {
  display: grid;
  gap: 0.8rem;
}

.registered-guests-panel h2 {
  margin: 0;
  color: #1e3a8a;
  font-size: 1.05rem;
}

.guest-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.85rem;
}

.details-actions {
  justify-content: flex-end;
}

@media (max-width: 900px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
