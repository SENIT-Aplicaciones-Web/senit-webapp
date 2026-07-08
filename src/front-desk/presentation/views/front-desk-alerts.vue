<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { toI18nKey } from '../../../shared/application/locale-key.js'
import useFrontDeskStore from '../../application/front-desk.store.js'
import { formatDate, formatCompactRemainingTime, formatTime, getRemainingMilliseconds } from '../../../shared/domain/services/date-format.service.js'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const frontDeskStore = useFrontDeskStore()
const searchTerm = ref('')

const alertStays = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()
  return frontDeskStore.activeStaysWithDetails
    .filter(stay => stay.status === 'endingSoon' || stay.status === 'overdue')
    .filter(stay => !term || stay.guest.fullName.toLowerCase().includes(term) || stay.room?.number?.toLowerCase().includes(term))
    .sort((a, b) => new Date(a.checkOutLimitAt) - new Date(b.checkOutLimitAt))
})

function remainingText(stay) {
  const remainingMilliseconds = getRemainingMilliseconds(stay.checkOutLimitAt, frontDeskStore.now)
  if (remainingMilliseconds <= 0) return t('front-desk.alerts.time-expired')
  return formatCompactRemainingTime(remainingMilliseconds)
}

function checkoutStay(stay) {
  router.push({ name: route.path.startsWith('/admin') ? 'admin-stay-checkout' : 'front-desk-stay-checkout', params: { id: stay.id } })
}
</script>

<template>
  <section class="page-shell alerts-page">
    <section class="page-header">
      <div>
        <h1>{{ t('front-desk.alerts.title') }}</h1>
        <p>{{ t('front-desk.alerts.subtitle') }}</p>
      </div>
    </section>

    <section class="summary-grid compact-summary-grid slim-stat-grid">
      <article class="summary-card orange"><span>{{ t('front-desk.alerts.ending-soon') }}</span><strong>{{ frontDeskStore.endingSoonStays.length }}</strong></article>
      <article class="summary-card red"><span>{{ t('front-desk.alerts.overdue') }}</span><strong>{{ frontDeskStore.overdueStays.length }}</strong></article>
      <article class="summary-card blue"><span>{{ t('front-desk.alerts.active-stays') }}</span><strong>{{ frontDeskStore.activeStaysWithDetails.length }}</strong></article>
      <article class="summary-card green"><span>{{ t('front-desk.alerts.available-rooms') }}</span><strong>{{ frontDeskStore.availableRooms.length }}</strong></article>
    </section>

    <section class="panel-card alerts-table-card">
      <div class="panel-header alerts-panel-header">
        <div>
          <h2>{{ t('front-desk.alerts.active-rooms-with-alerts') }}</h2>
          <p class="help-message">{{ t('front-desk.alerts.active-rooms-description') }}</p>
        </div>
        <span>{{ t('front-desk.reservations.records', { count: alertStays.length }) }}</span>
      </div>

      <section class="toolbar-card alert-inner-toolbar">
        <div class="compact-search-group alerts-search-group">
          <label>{{ t('front-desk.alerts.search-by-room-or-guest') }}</label>
          <form class="search-box alerts-search-box" @submit.prevent>
            <input v-model="searchTerm" type="text" :placeholder="t('front-desk.alerts.search-placeholder-short')" />
            <button type="submit" :aria-label="t('shared.actions.search')"><i class="pi pi-search"></i></button>
          </form>
        </div>
      </section>

      <div class="table-wrapper no-horizontal-scroll">
        <table class="data-table compact-table alerts-data-table">
          <thead>
            <tr>
              <th>{{ t('front-desk.common.room') }}</th>
              <th>{{ t('front-desk.common.guest') }}</th>
              <th>{{ t('front-desk.common.location') }}</th>
              <th>{{ t('front-desk.alerts.limit-date') }}</th>
              <th>{{ t('front-desk.common.time') }}</th>
              <th>{{ t('front-desk.alerts.remaining-time') }}</th>
              <th>{{ t('front-desk.alerts.status') }}</th>
              <th>{{ t('front-desk.common.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="stay in alertStays" :key="stay.id">
              <td><span class="room-badge">{{ stay.room?.number }}</span></td>
              <td>{{ stay.guest.fullName }}</td>
              <td>{{ t('front-desk.rooms.floor-with-number', { floor: stay.room?.floor }) }}</td>
              <td>{{ formatDate(stay.checkOutLimitAt) }}</td>
              <td>{{ formatTime(stay.checkOutLimitAt) }}</td>
              <td class="remaining-cell">{{ remainingText(stay) }}</td>
              <td><span class="status-badge" :class="stay.status">{{ t('front-desk.stay-status.' + toI18nKey(stay.status)) }}</span></td>
              <td class="actions"><button class="success-button table-action-button" type="button" @click="checkoutStay(stay)"><i class="pi pi-arrow-right"></i>{{ t('front-desk.stays.checkout-action') }}</button></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="!alertStays.length" class="empty-state">
        <i class="pi pi-check-circle"></i>
        <h2>{{ t('front-desk.alerts.no-active-alerts') }}</h2>
        <p>{{ t('front-desk.alerts.no-active-alerts-description') }}</p>
      </div>
    </section>
  </section>
</template>

<style scoped>
.alerts-search-group {
  flex: 1 1 620px;
}

.alerts-search-box {
  width: min(520px, 100%);
}

.alert-inner-toolbar {
  width: 100%;
}
</style>
