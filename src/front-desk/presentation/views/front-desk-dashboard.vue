<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import useIamStore from '../../../iam/application/iam.store.js'
import useFrontDeskStore from '../../application/front-desk.store.js'
import { formatDateTime } from '../../../shared/domain/services/date-format.service.js'
import { downloadTextPdf } from '../../../shared/infrastructure/pdf-receipt.service.js'
import FrontDeskStatCard from '../components/front-desk-stat-card.vue'
import UpcomingReservationsPanel from '../components/upcoming-reservations-panel.vue'
import AlertsPanel from '../components/alerts-panel.vue'
import RoomsQuickView from '../components/rooms-quick-view.vue'

const router = useRouter()
const { t } = useI18n()
const iamStore = useIamStore()
const frontDeskStore = useFrontDeskStore()
const reportFeedback = ref('')

const stats = computed(() => [
  { label: t('front-desk.dashboard.check-ins-today'), value: frontDeskStore.dashboardStats.checkInsToday, detail: t('front-desk.dashboard.registered'), icon: 'pi pi-sign-in', className: 'blue' },
  { label: t('front-desk.dashboard.check-outs-today'), value: frontDeskStore.dashboardStats.checkOutsToday, detail: t('front-desk.dashboard.finished'), icon: 'pi pi-sign-out', className: 'orange' },
  { label: t('front-desk.dashboard.available-rooms'), value: frontDeskStore.dashboardStats.availableRooms, detail: t('front-desk.dashboard.of-total', { total: frontDeskStore.dashboardStats.totalRooms }), icon: 'pi pi-building', className: 'green' },
  { label: t('front-desk.dashboard.occupancy'), value: `${frontDeskStore.dashboardStats.occupancy}%`, detail: t('front-desk.dashboard.current'), icon: 'pi pi-chart-pie', className: 'purple' }
])

const upcomingReservations = computed(() =>
  frontDeskStore.activeReservations
    .slice()
    .sort((a, b) => new Date(a.startAt) - new Date(b.startAt))
    .slice(0, 5)
)

const visibleAlerts = computed(() => [
  ...frontDeskStore.overdueStays.map(stay => ({
    id: `overdue-${stay.id}`,
    type: 'danger',
    title: `${t('front-desk.dashboard.checkout-pending')} - ${t('front-desk.common.room-abbr')} ${stay.room?.number}`,
    message: `${stay.guest.fullName} ${t('front-desk.dashboard.overdue-message')}`
  })),
  ...frontDeskStore.endingSoonStays.map(stay => ({
    id: `ending-${stay.id}`,
    type: 'warning',
    title: `${t('front-desk.dashboard.ending-soon-title')} - ${t('front-desk.common.room-abbr')} ${stay.room?.number}`,
    message: `${stay.guest.fullName} ${t('front-desk.dashboard.ending-soon-message')}`
  }))
].slice(0, 5))
const quickRooms = computed(() => frontDeskStore.roomsWithDetails.slice(0, 12))

function generateReport() {
  if (!frontDeskStore.hasProPlan) {
    reportFeedback.value = t('subscription.pro-required')
    window.setTimeout(() => { reportFeedback.value = '' }, 3000)
    return
  }

  const stats = frontDeskStore.dashboardStats
  const lines = [
    `${t('front-desk.dashboard.check-ins-today')}: ${stats.checkInsToday}`,
    `${t('front-desk.dashboard.check-outs-today')}: ${stats.checkOutsToday}`,
    `${t('front-desk.dashboard.available-rooms')}: ${stats.availableRooms} ${t('front-desk.dashboard.of-total', { total: stats.totalRooms })}`,
    `${t('front-desk.dashboard.occupancy')}: ${stats.occupancy}%`,
    `${t('front-desk.dashboard.alerts-and-tasks')}: ${frontDeskStore.endingSoonStays.length + frontDeskStore.overdueStays.length}`,
    '',
    t('front-desk.dashboard.upcoming-reservations'),
    ...upcomingReservations.value.map(reservation => `${reservation.guestName} - ${t('front-desk.common.room-abbr')} ${reservation.room?.number} - ${formatDateTime(reservation.startAt)}`)
  ]
  downloadTextPdf({
    filename: `reporte-recepcion-${new Date().toISOString().slice(0, 10)}.pdf`,
    title: t('front-desk.dashboard.title'),
    lines
  })
  reportFeedback.value = t('front-desk.dashboard.report-ready')
  window.setTimeout(() => { reportFeedback.value = '' }, 3000)
}

function goToReservationForm() { router.push({ name: 'front-desk-reservation-new' }) }
function goToReservations() { router.push({ name: 'front-desk-reservations' }) }
function goToAlerts() { router.push({ name: 'front-desk-alerts' }) }
function goToRooms() { router.push({ name: 'front-desk-rooms' }) }
</script>

<template>
  <section class="page-shell">
    <section class="toolbar-card dashboard-actions-toolbar">
      <div></div>
      <div class="actions-row">
        <button class="secondary-button" type="button" :disabled="!frontDeskStore.hasProPlan" @click="generateReport">
          <i class="pi pi-print"></i> {{ t('front-desk.dashboard.generate-report') }}
        </button>
        <button class="success-button" type="button" @click="router.push({ name: 'front-desk-check-in' })">
          <i class="pi pi-sign-in"></i> {{ t('front-desk.navigation.check-in') }}
        </button>
        <button class="primary-button" type="button" @click="goToReservationForm">
          <i class="pi pi-plus"></i> {{ t('front-desk.reservations.new-reservation') }}
        </button>
      </div>
    </section>
    <p v-if="reportFeedback" class="feedback success subtle-feedback">{{ reportFeedback }}</p>

    <section class="page-header">
      <div>
        <h1>{{ t('front-desk.dashboard.title') }}</h1>
        <p>{{ t('front-desk.dashboard.subtitle', { username: iamStore.currentUser?.username || t('front-desk.navigation.role-reception') }) }}</p>
      </div>
    </section>

    <section class="stats-grid">
      <front-desk-stat-card
        v-for="stat in stats"
        :key="stat.label"
        :label="stat.label"
        :value="stat.value"
        :detail="stat.detail"
        :icon="stat.icon"
        :class-name="stat.className"
      />
    </section>

    <section class="grid-two dashboard-panels-grid">
      <upcoming-reservations-panel :reservations="upcomingReservations" @view-all="goToReservations" />
      <alerts-panel :alerts="visibleAlerts" @view-all="goToAlerts" />
    </section>

    <rooms-quick-view :rooms="quickRooms" @open-rooms="goToRooms" />
  </section>
</template>
