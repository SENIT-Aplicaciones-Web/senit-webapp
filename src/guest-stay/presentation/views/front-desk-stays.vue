<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import useGuestStaysStore from '../../application/guest-stays.store.js'
import { toI18nKey } from '../../../shared/application/locale-key.js'
import { downloadTextPdf } from '../../../shared/infrastructure/pdf-receipt.service.js'
import { formatDateTime } from '../../../shared/domain/services/date-format.service.js'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const guestStaysStore = useGuestStaysStore()
const searchTerm = ref('')
const statusFilter = ref('all')
const feedback = ref({ type: '', message: '' })
const startingReservationId = ref(null)

const reservationStays = computed(() => guestStaysStore.activeReservationStays.map(reservation => ({
  id: `reservation-${reservation.id}`,
  reservationId: reservation.id,
  room: reservation.room,
  guest: { fullName: reservation.guestName },
  formattedCheckIn: formatDateTime(reservation.startAt),
  formattedCheckOut: formatDateTime(reservation.endAt),
  status: 'active',
  paymentStatus: reservation.paymentStatus ?? 'paid',
  total: Number(reservation.reservationAmount ?? reservation.prepaidAmount ?? 0),
  isReservation: true
})))

const operationalRows = computed(() => [...reservationStays.value, ...guestStaysStore.staysWithDetails])

const filteredStays = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()
  return operationalRows.value.filter(stay => {
    const matchesSearch = !term || stay.guest.fullName.toLowerCase().includes(term) || stay.room?.number?.toLowerCase().includes(term)
    const matchesStatus = statusFilter.value === 'all' || stay.status === statusFilter.value
    return matchesSearch && matchesStatus
  })
})

const activeCount = computed(() => guestStaysStore.activeStaysWithDetails.length + reservationStays.value.length)
const finishedToday = computed(() => guestStaysStore.dashboardStats.checkOutsToday)
const endingSoonCount = computed(() => guestStaysStore.endingSoonStays.length)
const overdueCount = computed(() => guestStaysStore.overdueStays.length)


function exportStaysReport() {
  if (!guestStaysStore.hasProPlan) {
    feedback.value = { type: 'error', message: t('subscription.pro-required') }
    return
  }

  const lines = filteredStays.value.map(stay =>
    `${stay.guest.fullName} | ${t('front-desk.common.room-abbr')} ${stay.room?.number ?? '-'} | ${stay.formattedCheckIn} | ${t('front-desk.stay-status.' + toI18nKey(stay.status))} | S/ ${stay.total.toFixed(2)}`
  )

  downloadTextPdf({
    filename: `reporte-estadias-${new Date().toISOString().slice(0, 10)}.pdf`,
    title: t('front-desk.stays.title'),
    lines: lines.length ? lines : [t('front-desk.stays.no-results')]
  })
}

function isAdminRoute() { return route.path.startsWith('/admin') }
function goToReservationForm() { router.push({ name: isAdminRoute() ? 'admin-reservation-new' : 'front-desk-reservation-new' }) }
function checkoutStay(stay) { router.push({ name: isAdminRoute() ? 'admin-stay-checkout' : 'front-desk-stay-checkout', params: { id: stay.id } }) }

async function startReservationStay(stay) {
  if (!stay.reservationId || startingReservationId.value) return
  startingReservationId.value = stay.reservationId
  const result = await guestStaysStore.startReservationStay(stay.reservationId)
  feedback.value = { type: result.ok ? 'success' : 'error', message: result.message }
  startingReservationId.value = null
  if (result.ok && result.stay?.id) checkoutStay(result.stay)
}

function resolveFeedbackMessage(message) {
  return /^[a-z0-9.-]+$/.test(message ?? '') ? t(message) : message
}
</script>

<template>
  <section class="page-shell">
    <section class="page-header">
      <div>
        <h1>{{ t('front-desk.stays.title') }}</h1>
        <p>{{ t('front-desk.stays.subtitle') }}</p>
      </div>
      <div class="actions-row">
        <button class="secondary-button" type="button" :disabled="!guestStaysStore.hasProPlan" @click="exportStaysReport"><i class="pi pi-file-pdf"></i>{{ t('shared.actions.export-pdf') }}</button>
        <button class="primary-button" type="button" @click="goToReservationForm"><i class="pi pi-plus"></i>{{ t('front-desk.stays.new-reservation') }}</button>
      </div>
    </section>
    <p v-if="feedback.message" class="feedback slim-feedback" :class="feedback.type">{{ resolveFeedbackMessage(feedback.message) }}</p>

    <section class="summary-grid stays-summary-grid slim-stat-grid">
      <article class="summary-card blue"><span>{{ t('front-desk.stays.active') }}</span><strong>{{ activeCount }}</strong></article>
      <article class="summary-card green"><span>{{ t('front-desk.stays.check-outs-today') }}</span><strong>{{ finishedToday }}</strong></article>
      <article class="summary-card orange"><span>{{ t('front-desk.stays.ending-soon') }}</span><strong>{{ endingSoonCount }}</strong></article>
      <article class="summary-card red"><span>{{ t('front-desk.stays.overdue') }}</span><strong>{{ overdueCount }}</strong></article>
    </section>

    <section class="toolbar-card compact-search-toolbar single-line-filters">
      <div class="compact-search-group stays-search-group">
        <label>{{ t('front-desk.stays.search-guest') }}</label>
        <div class="input-with-icon stays-search-box">
          <input v-model="searchTerm" type="text" :placeholder="t('front-desk.stays.search-placeholder-short')" />
          <button type="button" :aria-label="t('shared.actions.search')"><i class="pi pi-search"></i></button>
        </div>
      </div>
      <div class="status-filter-inline">
        <label>{{ t('front-desk.stays.status-label') }}</label>
        <select v-model="statusFilter">
          <option value="all">{{ t('front-desk.stays.all') }}</option>
          <option value="active">{{ t('front-desk.stay-status.active') }}</option>
          <option value="endingSoon">{{ t('front-desk.stay-status.ending-soon') }}</option>
          <option value="overdue">{{ t('front-desk.stay-status.overdue') }}</option>
          <option value="finished">{{ t('front-desk.stay-status.finished') }}</option>
        </select>
      </div>
    </section>

    <section class="panel-card stays-table">
      <div class="table-wrapper no-horizontal-scroll">
        <table class="data-table stays-data-table">
          <thead>
            <tr>
              <th>{{ t('front-desk.stays.room') }}</th>
              <th>{{ t('front-desk.stays.guest') }}</th>
              <th>{{ t('front-desk.stays.check-in') }}</th>
              <th>{{ t('front-desk.stay-details.checkout-limit') }}</th>
              <th>{{ t('front-desk.stays.status-label') }}</th>
              <th>{{ t('front-desk.checkout.payment-status') }}</th>
              <th>{{ t('front-desk.stays.amount-with-currency') }}</th>
              <th>{{ t('front-desk.stays.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="stay in filteredStays" :key="stay.id">
              <td><span class="room-badge">{{ stay.room?.number }}</span></td>
              <td>{{ stay.guest.fullName }}</td>
              <td>{{ stay.formattedCheckIn }}</td>
              <td>{{ stay.formattedCheckOut }}</td>
              <td><span class="status-badge" :class="stay.status">{{ t('front-desk.stay-status.' + toI18nKey(stay.status)) }}</span></td>
              <td><span class="status-badge adaptive-badge" :class="stay.paymentStatus === 'paid' ? 'paid' : 'pending'">{{ t('front-desk.payment-status.' + toI18nKey(stay.paymentStatus)) }}</span></td>
              <td class="numeric-cell">{{ stay.total.toFixed(2) }}</td>
              <td class="actions">
                <button v-if="stay.isReservation" class="success-button table-action-button" :disabled="startingReservationId === stay.reservationId" type="button" @click="startReservationStay(stay)"><i class="pi pi-arrow-right"></i>{{ t('front-desk.reservations.start-stay') }}</button>
                <button v-else class="success-button table-action-button" :disabled="stay.status === 'finished'" type="button" @click="checkoutStay(stay)"><i class="pi pi-arrow-right"></i>{{ t('front-desk.stays.checkout-action') }}</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="!filteredStays.length" class="empty-state"><i class="pi pi-search"></i><h2>{{ t('front-desk.stays.no-results') }}</h2></div>
    </section>
  </section>
</template>

<style scoped>
.stays-search-group {
  flex: 1 1 540px;
}

.stays-search-box {
  width: min(520px, 100%);
}

.stays-data-table td {
  font-weight: 400;
}

.adaptive-badge {
  max-width: 100%;
  white-space: normal;
  line-height: 1.05;
}
</style>
