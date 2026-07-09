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
    if (payment.subscriptionId || payment.plan) return false
    if (payment.status !== 'paid' || !paymentBelongsToActiveHotel(payment)) return false
    if (Number(payment.amount) <= 0) return false
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
  if (payment.stayId) return operationsStore.guestStays.some(stay => sameId(stay.id, payment.stayId) && sameId(stay.hotelId, hotelId))
  if (payment.reservationId) return operationsStore.reservations.some(reservation => sameId(reservation.id, payment.reservationId) && sameId(reservation.hotelId, hotelId) && reservation.status !== 'cancelled')
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

function createRevenueGroupsFromPayments() {
  const groups = new Map()

  filteredPayments.value.forEach(payment => {
    const paymentDate = new Date(payment.paidAt)
    if (Number.isNaN(paymentDate.getTime())) return
    const group = createRevenueGroup(paymentDate)
    const currentValue = groups.get(group.key)?.value ?? 0
    groups.set(group.key, { label: group.label, value: currentValue + Number(payment.amount) })
  })

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
  const grouped = createRevenueGroupsFromPayments()

  return Array.from(grouped.entries())
    .sort(([firstKey], [secondKey]) => firstKey.localeCompare(secondKey))
    .map(([, group]) => ({ ...group, value: Number(group.value) }))
    .filter(group => group.value > 0)
})

function chartBarClass(value) {
  return `bar-height-${chartBarHeight(value)}`
}

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
          <div class="form-field">
            <label for="revenueFromDate">{{ t('admin.dashboard.from-date') }}</label>
            <div class="date-input-wrapper">
              <input id="revenueFromDate" v-model="fromDate" type="date" />
              <i class="pi pi-calendar"></i>
            </div>
          </div>
          <div class="form-field">
            <label for="revenueToDate">{{ t('admin.dashboard.to-date') }}</label>
            <div class="date-input-wrapper">
              <input id="revenueToDate" v-model="toDate" type="date" />
              <i class="pi pi-calendar"></i>
            </div>
          </div>
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
              <div class="chart-bar-track">
                <div class="chart-bar-value">S/ {{ bar.value.toFixed(2) }}</div>
                <div class="chart-bar-frame">
                  <div class="chart-bar-column" :class="chartBarClass(bar.value)"></div>
                </div>
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
.date-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}
.date-input-wrapper input {
  width: 100%;
  padding-right: 2.6rem;
}
.date-input-wrapper i {
  position: absolute;
  right: 0.85rem;
  color: #1e3a8a;
  pointer-events: none;
}
.date-input-wrapper input::-webkit-calendar-picker-indicator {
  opacity: 0;
  cursor: pointer;
}
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
  margin-top: 2.65rem;
  padding: 0;
  color: #64748b;
  font-size: 0.78rem;
  text-align: right;
}
.chart-plot-area {
  position: relative;
  min-width: 0;
  border-left: 1px solid #cbd5e1;
  padding: 2.65rem 0.75rem 0;
  overflow-x: hidden;
}
.chart-grid-line {
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  background: #eef4ff;
}
.line-100 { top: 2.65rem; }
.line-75 { top: calc(2.65rem + 55px); }
.line-50 { top: calc(2.65rem + 110px); }
.line-25 { top: calc(2.65rem + 165px); }
.chart-bars {
  position: relative;
  z-index: 1;
  width: 100%;
  min-width: 0;
  height: calc(220px + 2.1rem);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(72px, 1fr));
  gap: clamp(0.45rem, 1.5vw, 1rem);
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
  min-width: 0;
}
.chart-bar-track {
  width: 100%;
  min-height: 0;
  display: grid;
  grid-template-rows: 2.2rem 1fr;
  justify-items: center;
}
.chart-bar-frame {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: end;
  justify-content: center;
}
.chart-bar-value {
  color: #1e3a8a;
  font-size: 0.76rem;
  font-weight: 650;
  white-space: nowrap;
  align-self: end;
  padding-bottom: 0.35rem;
}
.chart-bar-column {
  width: min(54px, 76%);
  min-height: 3px;
  border-radius: 12px 12px 0 0;
  background: linear-gradient(180deg, #2563eb, #35b98f);
  box-shadow: 0 10px 18px rgba(37, 99, 235, 0.14);
}
.bar-height-0 { height: 0%; }
.bar-height-1 { height: 1%; }
.bar-height-2 { height: 2%; }
.bar-height-3 { height: 3%; }
.bar-height-4 { height: 4%; }
.bar-height-5 { height: 5%; }
.bar-height-6 { height: 6%; }
.bar-height-7 { height: 7%; }
.bar-height-8 { height: 8%; }
.bar-height-9 { height: 9%; }
.bar-height-10 { height: 10%; }
.bar-height-11 { height: 11%; }
.bar-height-12 { height: 12%; }
.bar-height-13 { height: 13%; }
.bar-height-14 { height: 14%; }
.bar-height-15 { height: 15%; }
.bar-height-16 { height: 16%; }
.bar-height-17 { height: 17%; }
.bar-height-18 { height: 18%; }
.bar-height-19 { height: 19%; }
.bar-height-20 { height: 20%; }
.bar-height-21 { height: 21%; }
.bar-height-22 { height: 22%; }
.bar-height-23 { height: 23%; }
.bar-height-24 { height: 24%; }
.bar-height-25 { height: 25%; }
.bar-height-26 { height: 26%; }
.bar-height-27 { height: 27%; }
.bar-height-28 { height: 28%; }
.bar-height-29 { height: 29%; }
.bar-height-30 { height: 30%; }
.bar-height-31 { height: 31%; }
.bar-height-32 { height: 32%; }
.bar-height-33 { height: 33%; }
.bar-height-34 { height: 34%; }
.bar-height-35 { height: 35%; }
.bar-height-36 { height: 36%; }
.bar-height-37 { height: 37%; }
.bar-height-38 { height: 38%; }
.bar-height-39 { height: 39%; }
.bar-height-40 { height: 40%; }
.bar-height-41 { height: 41%; }
.bar-height-42 { height: 42%; }
.bar-height-43 { height: 43%; }
.bar-height-44 { height: 44%; }
.bar-height-45 { height: 45%; }
.bar-height-46 { height: 46%; }
.bar-height-47 { height: 47%; }
.bar-height-48 { height: 48%; }
.bar-height-49 { height: 49%; }
.bar-height-50 { height: 50%; }
.bar-height-51 { height: 51%; }
.bar-height-52 { height: 52%; }
.bar-height-53 { height: 53%; }
.bar-height-54 { height: 54%; }
.bar-height-55 { height: 55%; }
.bar-height-56 { height: 56%; }
.bar-height-57 { height: 57%; }
.bar-height-58 { height: 58%; }
.bar-height-59 { height: 59%; }
.bar-height-60 { height: 60%; }
.bar-height-61 { height: 61%; }
.bar-height-62 { height: 62%; }
.bar-height-63 { height: 63%; }
.bar-height-64 { height: 64%; }
.bar-height-65 { height: 65%; }
.bar-height-66 { height: 66%; }
.bar-height-67 { height: 67%; }
.bar-height-68 { height: 68%; }
.bar-height-69 { height: 69%; }
.bar-height-70 { height: 70%; }
.bar-height-71 { height: 71%; }
.bar-height-72 { height: 72%; }
.bar-height-73 { height: 73%; }
.bar-height-74 { height: 74%; }
.bar-height-75 { height: 75%; }
.bar-height-76 { height: 76%; }
.bar-height-77 { height: 77%; }
.bar-height-78 { height: 78%; }
.bar-height-79 { height: 79%; }
.bar-height-80 { height: 80%; }
.bar-height-81 { height: 81%; }
.bar-height-82 { height: 82%; }
.bar-height-83 { height: 83%; }
.bar-height-84 { height: 84%; }
.bar-height-85 { height: 85%; }
.bar-height-86 { height: 86%; }
.bar-height-87 { height: 87%; }
.bar-height-88 { height: 88%; }
.bar-height-89 { height: 89%; }
.bar-height-90 { height: 90%; }
.bar-height-91 { height: 91%; }
.bar-height-92 { height: 92%; }
.bar-height-93 { height: 93%; }
.bar-height-94 { height: 94%; }
.bar-height-95 { height: 95%; }
.bar-height-96 { height: 96%; }
.bar-height-97 { height: 97%; }
.bar-height-98 { height: 98%; }
.bar-height-99 { height: 99%; }
.bar-height-100 { height: 100%; }
.chart-bar-label {
  align-self: center;
  max-width: 100%;
  color: #475569;
  font-size: 0.78rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-top: 0.25rem;
}
.compact-empty { padding: 1rem; }
@media (max-width: 760px) {
  .revenue-classic-chart { grid-template-columns: 54px minmax(0, 1fr); }
  .chart-y-axis { font-size: 0.7rem; }
  .chart-bars { grid-template-columns: repeat(auto-fit, minmax(58px, 1fr)); }
  .chart-bar-value { font-size: 0.68rem; }
}
</style>
