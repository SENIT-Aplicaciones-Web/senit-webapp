<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { toI18nKey } from '../../../shared/application/locale-key.js'
import useReservationsStore from '../../application/reservations.store.js'
import { formatDate, formatTime } from '../../../shared/domain/services/date-format.service.js'
import { downloadTextPdf } from '../../../shared/infrastructure/pdf-receipt.service.js'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const reservationsStore = useReservationsStore()
const guestSearch = ref('')
const feedback = ref({ type: '', message: '' })
const cancellingReservationId = ref(null)
const startingReservationId = ref(null)

const filteredReservations = computed(() => {
  const term = guestSearch.value.trim().toLowerCase()
  return reservationsStore.reservationsWithDetails.filter(reservation =>
    !term || reservation.guestName.toLowerCase().includes(term)
  )
})


function exportReservationsReport() {
  if (!reservationsStore.hasProPlan) {
    feedback.value = { type: 'error', message: t('subscription.pro-required') }
    return
  }

  const lines = filteredReservations.value.map(reservation =>
    `${reservation.guestName} | ${t('front-desk.common.room-abbr')} ${reservation.room?.number ?? '-'} | ${formatDate(reservation.startAt)} ${formatTime(reservation.startAt)} | ${t('front-desk.reservation-status.' + toI18nKey(reservation.runtimeStatus))}`
  )

  downloadTextPdf({
    filename: `reporte-reservas-${new Date().toISOString().slice(0, 10)}.pdf`,
    title: t('front-desk.reservations.reservation-list'),
    lines: lines.length ? lines : [t('front-desk.reservations.no-results')]
  })
}

function goToReservationForm() {
  router.push({ name: route.path.startsWith('/admin') ? 'admin-reservation-new' : 'front-desk-reservation-new' })
}

function viewReservation(reservation) {
  router.push({
    name: route.path.startsWith('/admin') ? 'admin-reservation-details' : 'front-desk-reservation-details',
    params: { id: reservation.id }
  })
}

async function cancelReservation(reservation) {
  if (cancellingReservationId.value) return
  cancellingReservationId.value = reservation.id
  try {
    const result = await reservationsStore.cancelReservation(reservation.id)
    feedback.value = { type: result.ok ? 'success' : 'error', message: result.message }
  } finally {
    cancellingReservationId.value = null
  }
}

async function startReservationStay(reservation) {
  if (startingReservationId.value) return
  startingReservationId.value = reservation.id
  try {
    const result = await reservationsStore.startReservationStay(reservation.id)
    feedback.value = { type: result.ok ? 'success' : 'error', message: result.message }
    if (result.ok && result.stay?.id) {
      router.push({ name: route.path.startsWith('/admin') ? 'admin-stay-checkout' : 'front-desk-stay-checkout', params: { id: result.stay.id } })
    }
  } finally {
    startingReservationId.value = null
  }
}

function resolveFeedbackMessage(message) {
  return /^[a-z0-9.-]+$/.test(message ?? '') ? t(message) : message
}
</script>

<template>
  <section class="page-shell reservations-page">
    <section class="page-header">
      <div>
        <h1>{{ t('front-desk.reservations.title') }}</h1>
        <p>{{ t('front-desk.reservations.subtitle') }}</p>
      </div>
      <div class="actions-row">
        <button class="secondary-button" type="button" :disabled="!reservationsStore.hasProPlan" @click="exportReservationsReport">
          <i class="pi pi-file-pdf"></i>{{ t('shared.actions.export-pdf') }}
        </button>
        <button class="primary-button" type="button" @click="goToReservationForm">
          <i class="pi pi-plus"></i>{{ t('front-desk.reservations.new-reservation') }}
        </button>
      </div>
    </section>

    <section class="toolbar-card reservations-filter-card">
      <div class="form-field reservation-search-field">
        <label>{{ t('front-desk.reservations.search-label') }}</label>
        <form class="search-box reservation-search-box" @submit.prevent>
          <input v-model="guestSearch" type="text" :placeholder="t('front-desk.reservations.search-by-guest-name')" />
          <button type="submit" :aria-label="t('shared.actions.search')"><i class="pi pi-search"></i></button>
        </form>
      </div>
    </section>

    <p v-if="feedback.message" class="feedback" :class="feedback.type">{{ resolveFeedbackMessage(feedback.message) }}</p>

    <section class="panel-card">
      <div class="panel-header"><h2>{{ t('front-desk.reservations.reservation-list') }}</h2><span>{{ t('front-desk.reservations.records', { count: filteredReservations.length }) }}</span></div>
      <div class="table-wrapper">
        <table class="data-table reservation-table">
          <thead>
            <tr>
              <th>{{ t('front-desk.reservations.name') }}</th>
              <th>{{ t('front-desk.reservations.room') }}</th>
              <th>{{ t('front-desk.reservations.location') }}</th>
              <th>{{ t('front-desk.reservations.start-date') }}</th>
              <th>{{ t('front-desk.reservations.start-time') }}</th>
              <th>{{ t('front-desk.reservations.end-date') }}</th>
              <th>{{ t('front-desk.reservations.end-time') }}</th>
              <th>{{ t('front-desk.reservations.status') }}</th>
              <th>{{ t('front-desk.reservations.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="reservation in filteredReservations" :key="reservation.id">
              <td>{{ reservation.guestName }}</td>
              <td><span class="room-badge">{{ reservation.room?.number }}</span></td>
              <td>{{ t('front-desk.rooms.floor-with-number', { floor: reservation.room?.floor }) }}</td>
              <td>{{ formatDate(reservation.startAt) }}</td>
              <td>{{ formatTime(reservation.startAt) }}</td>
              <td>{{ formatDate(reservation.endAt) }}</td>
              <td>{{ formatTime(reservation.endAt) }}</td>
              <td><span class="status-badge" :class="reservation.runtimeStatus">{{ t('front-desk.reservation-status.' + toI18nKey(reservation.runtimeStatus)) }}</span></td>
              <td class="actions reservation-actions">
                <button
                  class="mini-button compact-action-button"
                  type="button"
                  @click="viewReservation(reservation)">
                  {{ t('front-desk.reservations.view-more') }}
                </button>
                <button
                  v-if="reservation.canStartStay"
                  class="secondary-button compact-action-button"
                  type="button"
                  :disabled="startingReservationId === reservation.id"
                  @click="startReservationStay(reservation)">
                  {{ t('front-desk.reservations.start-stay') }}
                </button>
                <button
                  class="danger-ghost-button compact-action-button"
                  type="button"
                  :disabled="!reservation.canCancel || cancellingReservationId === reservation.id || startingReservationId === reservation.id"
                  @click="cancelReservation(reservation)">
                  {{ t('front-desk.reservations.cancel') }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="!filteredReservations.length" class="empty-state"><i class="pi pi-search"></i><h2>{{ t('front-desk.reservations.no-results') }}</h2></div>
    </section>
  </section>
</template>

<style scoped>
.reservations-page { display: grid; gap: 1rem; }
.reservations-filter-card { justify-content: flex-start; margin-bottom: 0; }
.reservation-search-field { flex: 1 1 420px; max-width: 620px; }
.reservation-search-box { width: 100%; }
.reservation-table td { font-weight: 400; }
.reservation-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.compact-action-button { min-height: 34px; padding: 0.45rem 0.7rem; font-size: 0.78rem; }
</style>
