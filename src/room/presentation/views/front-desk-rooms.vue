<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { toI18nKey } from '../../../shared/application/locale-key.js'
import useRoomsStore from '../../application/rooms.store.js'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const roomsStore = useRoomsStore()

const searchTerm = ref(String(route.query.search ?? ''))
const floorFilter = ref('all')
const typeFilter = ref('all')
const statusFilter = ref('all')
const feedback = ref({ type: '', message: '' })

const statusLegend = computed(() => [
  { status: 'available', icon: 'pi pi-check-circle' },
  { status: 'occupied', icon: 'pi pi-user' },
  { status: 'endingSoon', icon: 'pi pi-clock' },
  { status: 'overdue', icon: 'pi pi-exclamation-triangle' },
  { status: 'cleaning', icon: 'pi pi-sparkles' },
  { status: 'maintenance', icon: 'pi pi-wrench' }
])

function getRoomStatusIcon(status) {
  return statusLegend.value.find(item => item.status === status)?.icon ?? 'pi pi-info-circle'
}


function uniqueValues(values) {
  return values.reduce((uniqueItems, value) => {
    if (!uniqueItems.includes(value)) uniqueItems.push(value)
    return uniqueItems
  }, [])
}

const floors = computed(() => uniqueValues(roomsStore.rooms.map(room => room.floor)).sort((a, b) => a - b))
const types = computed(() => uniqueValues(roomsStore.rooms.map(room => room.type)))

const filteredRooms = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()
  return roomsStore.roomsWithDetails.filter(room => {
    const matchesSearch = !term || room.number.toLowerCase().includes(term) || room.guestName.toLowerCase().includes(term)
    const matchesFloor = floorFilter.value === 'all' || Number(room.floor) === Number(floorFilter.value)
    const matchesType = typeFilter.value === 'all' || room.type === typeFilter.value
    const matchesStatus = statusFilter.value === 'all' || room.runtimeStatus === statusFilter.value
    return matchesSearch && matchesFloor && matchesType && matchesStatus
  })
})

const roomsByFloor = computed(() => {
  const groups = new Map()
  filteredRooms.value.forEach(room => {
    if (!groups.has(room.floor)) groups.set(room.floor, [])
    groups.get(room.floor).push(room)
  })
  return [...groups.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([floor, rooms]) => ({ floor, rooms }))
})

function goToReservationForm() { router.push({ name: route.path.startsWith('/admin') ? 'admin-reservation-new' : 'front-desk-reservation-new' }) }
function viewStay(room) {
  if (!room.stayId) return
  router.push({ name: route.path.startsWith('/admin') ? 'admin-stay-checkout' : 'front-desk-stay-checkout', params: { id: room.stayId } })
}
async function markAvailable(room) {
  const result = await roomsStore.updateRoomStatus(room.id, 'available')
  feedback.value = { type: result.ok ? 'success' : 'error', message: result.message }
}

function resolveFeedbackMessage(message) {
  return /^[a-z0-9.-]+$/.test(message ?? '') ? t(message) : message
}
</script>

<template>
  <section class="page-shell rooms-page">
    <section class="page-header room-page-header">
      <div>
        <h1>{{ t('front-desk.rooms.title') }}</h1>
        <p>{{ t('front-desk.rooms.subtitle') }}</p>
      </div>
      <button class="primary-button" type="button" @click="goToReservationForm">
        <i class="pi pi-plus"></i>{{ t('front-desk.rooms.new-reservation') }}
      </button>
    </section>

    <section class="toolbar-card room-filter-toolbar room-filter-card">
      <div class="form-field room-search-field">
        <label>{{ t('front-desk.rooms.search-label') }}</label>
        <form class="input-with-icon room-search-box" @submit.prevent>
          <input v-model="searchTerm" type="text" :placeholder="t('front-desk.rooms.search-placeholder-short')" />
          <button type="submit" :aria-label="t('shared.actions.search')"><i class="pi pi-search"></i></button>
        </form>
      </div>
      <div class="form-field compact-filter-field">
        <label>{{ t('front-desk.rooms.floor') }}</label>
        <select v-model="floorFilter">
          <option value="all">{{ t('front-desk.rooms.all') }}</option>
          <option v-for="floor in floors" :key="floor" :value="floor">{{ t('front-desk.rooms.floor-with-number', { floor }) }}</option>
        </select>
      </div>
      <div class="form-field compact-filter-field">
        <label>{{ t('front-desk.rooms.type') }}</label>
        <select v-model="typeFilter">
          <option value="all">{{ t('front-desk.rooms.all') }}</option>
          <option v-for="type in types" :key="type" :value="type">{{ type }}</option>
        </select>
      </div>
      <div class="form-field compact-filter-field">
        <label>{{ t('front-desk.rooms.state') }}</label>
        <select v-model="statusFilter">
          <option value="all">{{ t('front-desk.rooms.all') }}</option>
          <option value="available">{{ t('front-desk.rooms.status.available') }}</option>
          <option value="occupied">{{ t('front-desk.rooms.status.occupied') }}</option>
          <option value="endingSoon">{{ t('front-desk.rooms.status.ending-soon') }}</option>
          <option value="overdue">{{ t('front-desk.rooms.status.overdue') }}</option>
          <option value="cleaning">{{ t('front-desk.rooms.status.cleaning') }}</option>
          <option value="maintenance">{{ t('front-desk.rooms.status.maintenance') }}</option>
        </select>
      </div>
    </section>

    <section class="room-status-legend panel-card" :aria-label="t('front-desk.rooms.state')">
      <span v-for="item in statusLegend" :key="item.status" class="room-legend-item" :class="item.status">
        <i :class="item.icon"></i>
        {{ t('front-desk.rooms.status.' + toI18nKey(item.status)) }}
      </span>
    </section>

    <p v-if="feedback.message" class="feedback slim-feedback" :class="feedback.type">{{ resolveFeedbackMessage(feedback.message) }}</p>

    <section v-for="group in roomsByFloor" :key="group.floor" class="panel-card room-floor-panel">
      <div class="panel-header">
        <h2>{{ t('front-desk.rooms.floor-with-number', { floor: String(group.floor).padStart(2, '0') }) }}</h2>
        <span class="muted-count">{{ t('front-desk.rooms.rooms-count', { count: group.rooms.length }) }}</span>
      </div>
      <div class="room-tile-grid">
        <article v-for="room in group.rooms" :key="room.id" class="room-tile" :class="room.runtimeStatus">
          <span class="room-number">{{ room.number }}</span>
          <span class="room-type">{{ room.type }}</span>
          <span v-if="room.guestName" class="room-guest">{{ room.guestName }}</span>
          <span class="room-status-pill" :class="room.runtimeStatus">
            <i :class="getRoomStatusIcon(room.runtimeStatus)"></i>
            {{ t('front-desk.rooms.status.' + toI18nKey(room.runtimeStatus)) }}
          </span>
          <button v-if="room.stayId" class="mini-button room-tile-action" type="button" @click="viewStay(room)">{{ t('front-desk.rooms.go-checkout') }}</button>
          <button v-else-if="room.status === 'cleaning'" class="success-soft-button room-tile-action" type="button" @click="markAvailable(room)">{{ t('front-desk.rooms.completed') }}</button>
        </article>
      </div>
    </section>

    <section v-if="!roomsByFloor.length" class="empty-state panel-card">
      <i class="pi pi-search"></i>
      <h2>{{ t('front-desk.rooms.no-results') }}</h2>
      <p>{{ t('front-desk.rooms.adjust-filters') }}</p>
    </section>
  </section>
</template>

<style scoped>
.rooms-page {
  display: grid;
  gap: 1rem;
}

.room-page-header {
  margin-bottom: 0;
}

.room-filter-card {
  justify-content: flex-start;
  align-items: end;
  gap: 0.9rem;
}

.room-search-field {
  flex: 1 1 360px;
  min-width: 320px;
}

.room-search-box {
  width: 100%;
}

.compact-filter-field {
  flex: 0 0 158px;
}

.room-floor-panel {
  padding: 1.1rem 1.2rem 1.25rem;
}

.room-tile-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, 136px);
  gap: 1rem;
}

.room-tile {
  width: 136px;
  min-height: 234px;
  display: flex;
  flex-direction: column;
  gap: 0.28rem;
  padding: 0.9rem;
  border: 1.5px solid #dbe3ef;
  border-radius: 16px;
  background: #ffffff;
  color: #0f172a;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
  overflow: hidden;
}

.room-tile:hover {
  transform: translateY(-3px);
  box-shadow: 0 18px 30px rgba(15, 23, 42, 0.1);
}

.room-number {
  color: #183a8f;
  font-size: 1.15rem;
  font-weight: 700;
}

.room-type {
  font-size: 0.8rem;
  font-weight: 600;
}

.room-guest {
  min-height: 1rem;
  color: #475569;
  font-size: 0.74rem;
  line-height: 1.15;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.room-status-text {
  margin-top: auto;
  color: #334155;
  font-size: 0.67rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  overflow-wrap: anywhere;
}

.room-tile.occupied {
  background: #eaf2ff;
  border-color: #2563eb;
  color: #0f172a;
}

.room-tile.occupied .room-number,
.room-tile.occupied .room-type,
.room-tile.occupied .room-guest,
.room-tile.occupied .room-status-text {
  color: #1e3a8a;
}

.room-tile.endingSoon {
  background: #fff7ed;
  border-color: #f59e0b;
  color: #7c2d12;
}

.room-tile.overdue {
  background: #fff1f2;
  border-color: #ef4444;
  color: #7f1d1d;
}

.room-tile.overdue .room-number,
.room-tile.overdue .room-status-text { color: #b91c1c; }
.room-tile.endingSoon .room-number,
.room-tile.endingSoon .room-status-text { color: #b45309; }

.room-tile.cleaning {
  background: #f0fdfa;
  border-color: #14b8a6;
  border-style: dashed;
}

.room-tile.maintenance {
  background: #f8fafc;
  border-color: #64748b;
}

.room-tile-action {
  width: 100%;
  min-height: 32px;
  margin-top: 0.45rem;
  padding: 0.3rem 0.5rem;
  font-size: 0.72rem;
}

.success-soft-button {
  border: 1px solid #86efac;
  border-radius: 12px;
  background: #dcfce7;
  color: #15803d;
  font-weight: 650;
}

@media (max-width: 760px) {
  .room-filter-card { align-items: stretch; flex-direction: column; }
  .room-search-field, .compact-filter-field { min-width: 0; width: 100%; flex: 1 1 auto; }
  .room-tile-grid { grid-template-columns: repeat(auto-fill, minmax(128px, 1fr)); }
  .room-tile { width: 100%; }
}
</style>

<style scoped>
.room-tile.occupied {
  background: #eef5ff;
  border-color: #2563eb;
  color: #0f172a;
}

.room-tile.occupied .room-number,
.room-tile.occupied .room-type,
.room-tile.occupied .room-guest,
.room-tile.occupied .room-status-text {
  color: #0f172a;
}

.room-tile.occupied .room-number,
.room-tile.occupied .room-status-text {
  color: #1d4ed8;
}

.room-tile-action,
.success-soft-button {
  border-radius: 12px;
  min-height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 650;
}

.room-tile .mini-button.room-tile-action {
  border: 1px solid #bfdbfe;
  background: #dbeafe;
  color: #1e3a8a;
}

.room-tile .mini-button.room-tile-action:hover,
.success-soft-button:hover {
  filter: brightness(0.98);
  box-shadow: 0 8px 18px rgba(30, 58, 138, 0.12);
}

.room-tile.cleaning .success-soft-button {
  background: #dcfce7;
  color: #15803d;
  border-color: #86efac;
}
</style>

<style scoped>
.room-tile-grid {
  grid-template-columns: repeat(auto-fill, 152px);
}

.room-tile {
  width: 152px;
  min-height: 244px;
  padding: 0.95rem;
}

.room-tile.occupied,
.room-tile.occupied:hover {
  background: #eff6ff;
  border-color: #2563eb;
  color: #0f172a;
}

.room-tile.occupied .room-number,
.room-tile.occupied .room-type,
.room-tile.occupied .room-guest,
.room-tile.occupied .room-status-text {
  color: #0f172a;
}

.room-tile.occupied .room-number,
.room-tile.occupied .room-status-text {
  color: #1d4ed8;
}

.room-tile.endingSoon {
  background: #fffbeb;
  border-color: #f59e0b;
}

.room-tile.maintenance {
  background: #f8fafc;
  border-color: #94a3b8;
}

.room-tile-action,
.room-tile .mini-button.room-tile-action,
.success-soft-button {
  width: 100%;
  min-height: 36px;
  margin-top: 0.55rem;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 650;
  line-height: 1.05;
}

.room-tile .mini-button.room-tile-action {
  border: 1px solid #93c5fd;
  background: #dbeafe;
  color: #1e3a8a;
}

.room-tile.cleaning .success-soft-button {
  border-color: #86efac;
  background: #dcfce7;
  color: #15803d;
}

.room-status-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  padding: 0.9rem 1rem;
  margin-bottom: 1rem;
}

.room-legend-item,
.room-status-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  border-radius: 999px;
  font-weight: 800;
  line-height: 1;
}

.room-legend-item {
  min-height: 32px;
  padding: 0.45rem 0.7rem;
  font-size: 0.78rem;
}

.room-status-pill {
  margin-top: auto;
  padding: 0.48rem 0.62rem;
  font-size: 0.66rem;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.room-status-pill.available,
.room-legend-item.available { background: #dcfce7; color: #15803d; border: 1px solid #86efac; }
.room-status-pill.occupied,
.room-legend-item.occupied { background: #dbeafe; color: #1d4ed8; border: 1px solid #93c5fd; }
.room-status-pill.endingSoon,
.room-legend-item.endingSoon { background: #fef3c7; color: #b45309; border: 1px solid #fcd34d; }
.room-status-pill.overdue,
.room-legend-item.overdue { background: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5; }
.room-status-pill.cleaning,
.room-legend-item.cleaning { background: #ccfbf1; color: #0f766e; border: 1px dashed #14b8a6; }
.room-status-pill.maintenance,
.room-legend-item.maintenance { background: #f1f5f9; color: #475569; border: 1px solid #94a3b8; }
</style>
