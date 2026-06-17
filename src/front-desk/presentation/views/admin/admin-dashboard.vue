<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { toI18nKey } from '../../../../shared/application/locale-key.js'
import useHotelOperationsStore from '../../../application/front-desk.store.js'
import { formatDate } from '../../../../shared/domain/services/date-format.service.js'
import { downloadTextPdf } from '../../../../shared/infrastructure/pdf-receipt.service.js'

const router = useRouter()
const operationsStore = useHotelOperationsStore()
const { t } = useI18n()
function formatDateInputValue(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const currentDate = new Date()
const today = formatDateInputValue(currentDate)
const firstDay = formatDateInputValue(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1))
const fromDate = ref(firstDay)
const toDate = ref(today)
const exportFeedback = ref({ type: '', message: '' })

const roomStatus = computed(() => {
  const statuses = ['available', 'occupied', 'cleaning', 'maintenance']
  return statuses.map(status => ({
    status,
    label: t(`front-desk.rooms.status.${toI18nKey(status)}`),
    count: operationsStore.rooms.filter(room => room.status === status).length
  }))
})

const filteredPayments = computed(() => {
  const start = fromDate.value ? new Date(`${fromDate.value}T00:00:00`).getTime() : 0
  const end = toDate.value ? new Date(`${toDate.value}T23:59:59`).getTime() : Date.now()
  return operationsStore.payments.filter(payment => {
    if (payment.status !== 'completed' || !paymentBelongsToActiveHotel(payment)) return false
    const paidAt = new Date(payment.paidAt).getTime()
    return !Number.isNaN(paidAt) && paidAt >= start && paidAt <= end
  })
})

const revenueGenerated = computed(() => filteredPayments.value.reduce((sum, payment) => sum + Number(payment.amount), 0))

const revenueRangeMode = computed(() => {
  const start = fromDate.value ? new Date(`${fromDate.value}T00:00:00`) : new Date()
  const end = toDate.value ? new Date(`${toDate.value}T23:59:59`) : new Date()
  const rangeInDays = Math.ceil((end.getTime() - start.getTime()) / 86400000)
  if (rangeInDays <= 62) return 'day'
  if (rangeInDays <= 730) return 'month'
  return 'year'
})

function padDatePart(value) {
  return String(value).padStart(2, '0')
}

function sameId(firstValue, secondValue) {
  return String(firstValue ?? '') === String(secondValue ?? '')
}

function paymentBelongsToActiveHotel(payment) {
  const hotelId = operationsStore.activeHotel?.id
  if (!hotelId) return false
  if (payment.hotelId) return sameId(payment.hotelId, hotelId)
  if (payment.stayId) return operationsStore.guestStays.some(stay => sameId(stay.id, payment.stayId))
  if (payment.reservationId) return operationsStore.reservations.some(reservation => sameId(reservation.id, payment.reservationId))
  return false
}

function createRevenueGroup(paymentDate) {
  if (revenueRangeMode.value === 'year') {
    const year = paymentDate.getFullYear()
    return { key: String(year), label: String(year) }
  }

  if (revenueRangeMode.value === 'month') {
    const month = padDatePart(paymentDate.getMonth() + 1)
    const year = paymentDate.getFullYear()
    return { key: `${year}-${month}`, label: `${month}/${String(year).slice(-2)}` }
  }

  const day = padDatePart(paymentDate.getDate())
  const month = padDatePart(paymentDate.getMonth() + 1)
  const year = paymentDate.getFullYear()
  return { key: `${year}-${month}-${day}`, label: formatDate(paymentDate.toISOString()) }
}

function getDateAtStart(dateValue) {
  const value = String(dateValue ?? '')
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (match) return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function getHotelRevenueStartDate() {
  const selectedStart = getDateAtStart(`${fromDate.value}T00:00:00`) ?? new Date()
  const hotelStart = getDateAtStart(operationsStore.activeHotel?.createdAt)
  if (!hotelStart) return selectedStart
  return hotelStart.getTime() > selectedStart.getTime() ? hotelStart : selectedStart
}

function getRevenueEndDate() {
  return getDateAtStart(`${toDate.value}T00:00:00`) ?? new Date()
}

function addDateUnit(date, unit) {
  const nextDate = new Date(date)
  if (unit === 'year') nextDate.setFullYear(nextDate.getFullYear() + 1)
  else if (unit === 'month') nextDate.setMonth(nextDate.getMonth() + 1)
  else nextDate.setDate(nextDate.getDate() + 1)
  return nextDate
}

function getRevenueGroupStart(date) {
  if (revenueRangeMode.value === 'year') return new Date(date.getFullYear(), 0, 1)
  if (revenueRangeMode.value === 'month') return new Date(date.getFullYear(), date.getMonth(), 1)
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function createEmptyRevenueGroups() {
  const start = getRevenueGroupStart(getHotelRevenueStartDate())
  const end = getRevenueGroupStart(getRevenueEndDate())
  const groups = new Map()
  let cursor = new Date(start)

  while (cursor.getTime() <= end.getTime()) {
    const group = createRevenueGroup(cursor)
    groups.set(group.key, { label: group.label, value: 0 })
    cursor = addDateUnit(cursor, revenueRangeMode.value)
  }

  return groups
}

const revenueAxisMaximum = computed(() => {
  const highestValue = Math.max(...revenueBars.value.map(bar => bar.value), 0)
  if (highestValue <= 0) return 100
  return Math.ceil(highestValue / 100) * 100
})

const revenueAxisTicks = computed(() => [
  revenueAxisMaximum.value,
  revenueAxisMaximum.value * 0.75,
  revenueAxisMaximum.value * 0.5,
  revenueAxisMaximum.value * 0.25,
  0
])

function chartBarHeight(value) {
  if (!revenueAxisMaximum.value || Number(value) <= 0) return 0
  return Math.max(3, Math.round((Number(value) / revenueAxisMaximum.value) * 100))
}

function exportRevenueReport() {
  if (!operationsStore.hasProPlan) {
    exportFeedback.value = { type: 'error', message: t('subscription.pro-required') }
    return
  }

  const lines = [
    `${t('admin.dashboard.from-date')}: ${fromDate.value}`,
    `${t('admin.dashboard.to-date')}: ${toDate.value}`,
    `${t('admin.dashboard.revenue-generated')}: S/ ${revenueGenerated.value.toFixed(2)}`,
    '',
    ...revenueBars.value.map(bar => `${bar.label}: S/ ${bar.value.toFixed(2)}`)
  ]

  downloadTextPdf({
    filename: `reporte-ingresos-${new Date().toISOString().slice(0, 10)}.pdf`,
    title: t('admin.dashboard.revenue-by-date'),
    lines
  })
  exportFeedback.value = { type: 'success', message: t('admin.dashboard.report-ready') }
}

const revenueBars = computed(() => {
  const grouped = createEmptyRevenueGroups()

  filteredPayments.value.forEach(payment => {
    const paymentDate = new Date(payment.paidAt)
    if (Number.isNaN(paymentDate.getTime())) return
    const group = createRevenueGroup(paymentDate)
    const currentValue = grouped.get(group.key)?.value ?? 0
    grouped.set(group.key, { label: group.label, value: currentValue + Number(payment.amount) })
  })

  return Array.from(grouped.entries())
    .sort(([firstKey], [secondKey]) => firstKey.localeCompare(secondKey))
    .map(([, group]) => group)
})

function resolveFeedbackMessage(message) {
  return /^[a-z0-9.-]+$/.test(message ?? '') ? t(message) : message
}
</script>

<template>
  <section class="page-shell admin-dashboard-page">
    <section class="page-header">
      <div>
        <h1>{{ t('admin.dashboard.title') }}</h1>
        <p>{{ t('admin.dashboard.subtitle') }}</p>
      </div>
      <button class="secondary-button" type="button" :disabled="!operationsStore.hasProPlan" @click="exportRevenueReport"><i class="pi pi-file-pdf"></i>{{ t('shared.actions.export-pdf') }}</button>
    </section>
    <p v-if="exportFeedback.message" class="feedback slim-feedback" :class="exportFeedback.type">{{ resolveFeedbackMessage(exportFeedback.message) }}</p>
    <section class="summary-grid compact-summary-grid">
      <article class="summary-card blue"><span>{{ t('admin.dashboard.total-rooms') }}</span><strong>{{ operationsStore.rooms.length }}</strong></article>
      <article class="summary-card green"><span>{{ t('admin.dashboard.available') }}</span><strong>{{ operationsStore.availableRooms.length }}</strong></article>
      <article class="summary-card orange"><span>{{ t('admin.dashboard.active-stays') }}</span><strong>{{ operationsStore.activeStaysWithDetails.length }}</strong></article>
      <article class="summary-card purple"><span>{{ t('admin.dashboard.revenue-generated') }}</span><strong class="money-value">S/ {{ revenueGenerated.toFixed(0) }}</strong></article>
    </section>

    <section class="panel-card revenue-panel">
      <div class="panel-header revenue-header">
        <div>
          <h2>{{ t('admin.dashboard.revenue-by-date') }}</h2>
          <p class="help-message">{{ t('admin.dashboard.revenue-by-date-description') }}</p>
        </div>
        <div class="revenue-filters">
          <div class="form-field"><label>{{ t('admin.dashboard.from-date') }}</label><input v-model="fromDate" type="date" /></div>
          <div class="form-field"><label>{{ t('admin.dashboard.to-date') }}</label><input v-model="toDate" type="date" /></div>
        </div>
      </div>
      <div v-if="revenueBars.length" class="revenue-classic-chart" :aria-label="t('admin.dashboard.revenue-by-date')">
        <div class="chart-y-axis">
          <span v-for="tick in revenueAxisTicks" :key="tick">S/ {{ Number(tick).toFixed(0) }}</span>
        </div>
        <div class="chart-plot-area">
          <div class="chart-grid-line line-100"></div>
          <div class="chart-grid-line line-75"></div>
          <div class="chart-grid-line line-50"></div>
          <div class="chart-grid-line line-25"></div>
          <div class="chart-bars">
            <article v-for="bar in revenueBars" :key="bar.label" class="chart-bar-item">
              <div class="chart-bar-track" :style="{ '--bar-height': `${chartBarHeight(bar.value)}%` }">
                <div v-if="bar.value > 0" class="chart-bar-value">S/ {{ bar.value.toFixed(2) }}</div>
                <div class="chart-bar-column" :class="{ zero: bar.value <= 0 }"></div>
              </div>
              <div class="chart-bar-label">{{ bar.label }}</div>
            </article>
          </div>
        </div>
      </div>
      <div v-else class="empty-state compact-empty"><i class="pi pi-chart-bar"></i><h2>{{ t('admin.dashboard.no-revenue') }}</h2></div>
    </section>

    <section class="grid-two">
      <article class="panel-card">
        <div class="panel-header"><h2>{{ t('admin.dashboard.room-status-title-new') }}</h2><button class="link-button" @click="router.push({ name: 'admin-rooms' })">{{ t('admin.dashboard.manage-rooms') }}</button></div>
        <div class="result-list">
          <div v-for="item in roomStatus" :key="item.status" class="result-item"><span><strong>{{ item.label }}</strong></span><span class="status-badge" :class="item.status">{{ item.count }}</span></div>
        </div>
      </article>
      <article class="panel-card">
        <div class="panel-header"><h2>{{ t('admin.dashboard.quick-access') }}</h2></div>
        <div class="result-list">
          <button class="result-item" @click="router.push({ name: 'admin-hotel' })"><span><strong>{{ t('admin.dashboard.hotel-data') }}</strong><small>{{ t('admin.dashboard.hotel-data-description') }}</small></span><i class="pi pi-arrow-right"></i></button>
          <button class="result-item" @click="router.push({ name: 'admin-rooms' })"><span><strong>{{ t('admin.dashboard.register-room') }}</strong><small>{{ t('admin.dashboard.register-room-description') }}</small></span><i class="pi pi-arrow-right"></i></button>
          <button class="result-item" @click="router.push({ name: 'admin-staff' })"><span><strong>{{ t('admin.dashboard.staff-roles') }}</strong><small>{{ t('admin.dashboard.staff-roles-description') }}</small></span><i class="pi pi-arrow-right"></i></button>
        </div>
      </article>
    </section>
  </section>
</template>

<style scoped>
.admin-dashboard-page { display: grid; gap: 1rem; }
.revenue-panel { margin-bottom: 0.25rem; }
.revenue-header { align-items: flex-start; }
.revenue-filters { display: flex; gap: 0.8rem; flex-wrap: wrap; }
.revenue-filters .form-field { min-width: 170px; }
.revenue-classic-chart {
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr);
  gap: 0.75rem;
  min-height: 270px;
  align-items: start;
  padding: 0.75rem 0.25rem 0.25rem;
}
.chart-y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 220px;
  margin-top: 0.75rem;
  padding: 0;
  color: #64748b;
  font-size: 0.78rem;
  text-align: right;
}
.chart-plot-area {
  position: relative;
  min-width: 0;
  border-left: 1px solid #cbd5e1;
  padding: 0.75rem 0.75rem 0;
  overflow-x: auto;
}
.chart-grid-line {
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  background: #eef4ff;
}
.line-100 { top: 0.75rem; }
.line-75 { top: calc(0.75rem + 55px); }
.line-50 { top: calc(0.75rem + 110px); }
.line-25 { top: calc(0.75rem + 165px); }
.chart-bars {
  position: relative;
  z-index: 1;
  min-width: 360px;
  height: calc(220px + 2.1rem);
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(86px, 1fr);
  gap: 1rem;
  align-items: stretch;
  padding-bottom: 2.1rem;
}
.chart-bars::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 2.1rem;
  height: 1px;
  background: #cbd5e1;
}
.chart-bar-item {
  position: relative;
  z-index: 1;
  height: 100%;
  display: grid;
  grid-template-rows: 220px 2.1rem;
  justify-items: center;
}
.chart-bar-track {
  position: relative;
  width: 100%;
  min-height: 0;
}
.chart-bar-value {
  position: absolute;
  left: 50%;
  bottom: calc(var(--bar-height, 0%) + 0.45rem);
  transform: translateX(-50%);
  color: #1e3a8a;
  font-size: 0.78rem;
  font-weight: 650;
  white-space: nowrap;
}
.chart-bar-column {
  position: absolute;
  left: 50%;
  bottom: 0;
  width: min(54px, 80%);
  height: var(--bar-height, 0%);
  transform: translateX(-50%);
  border-radius: 12px 12px 0 0;
  background: linear-gradient(180deg, #2563eb, #35b98f);
  box-shadow: 0 10px 18px rgba(37, 99, 235, 0.14);
}
.chart-bar-column.zero {
  height: 4px;
  background: #ffffff;
  border: 1px solid #dbe6f5;
  box-shadow: none;
}
.chart-bar-label {
  align-self: center;
  color: #475569;
  font-size: 0.78rem;
  white-space: nowrap;
  padding-top: 0.25rem;
}
.compact-empty { padding: 1rem; }
@media (max-width: 760px) {
  .revenue-classic-chart { grid-template-columns: 54px minmax(0, 1fr); }
  .chart-y-axis { font-size: 0.7rem; }
  .chart-bars { grid-auto-columns: 74px; }
}
</style>
