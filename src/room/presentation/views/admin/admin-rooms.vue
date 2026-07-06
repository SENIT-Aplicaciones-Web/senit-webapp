<script setup>
import { computed, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { toI18nKey } from '../../../../shared/application/locale-key.js'
import useHotelOperationsStore from '../../../application/rooms.store.js'

const operationsStore = useHotelOperationsStore()
const { t } = useI18n()
const creationFeedback = ref({ type: '', message: '' })
const rowFeedback = reactive({})
const editingRoomId = ref(null)
const searchTerm = ref('')
const statusFilter = ref('all')
const floorFilter = ref('all')
const typeFilter = ref('all')
const form = reactive({ number: '', floor: 1, type: 'Standard', capacity: 2, pricePerHour: 20, status: 'available' })
const editForm = reactive({ number: '', floor: 1, type: 'Standard', capacity: 2, pricePerHour: 20 })

const roomTypeOptions = computed(() => [
  { label: t('admin.rooms.standard'), value: 'Standard' },
  { label: t('admin.rooms.deluxe'), value: 'Deluxe' },
  { label: t('admin.rooms.suite'), value: 'Suite' }
])

function uniqueValues(values) {
  return values.reduce((uniqueItems, value) => {
    if (!uniqueItems.includes(value)) uniqueItems.push(value)
    return uniqueItems
  }, [])
}

const floors = computed(() => uniqueValues(operationsStore.rooms.map(room => room.floor)).sort((a, b) => a - b))
const types = computed(() => uniqueValues(operationsStore.rooms.map(room => room.type)))

const statusOptions = computed(() => [
  { label: t('front-desk.rooms.status.available'), value: 'available' },
  { label: t('front-desk.rooms.status.cleaning'), value: 'cleaning' },
  { label: t('front-desk.rooms.status.maintenance'), value: 'maintenance' }
])


const statusLegend = computed(() => [
  { status: 'available', icon: 'pi pi-check-circle' },
  { status: 'occupied', icon: 'pi pi-user' },
  { status: 'endingSoon', icon: 'pi pi-clock' },
  { status: 'cleaning', icon: 'pi pi-sparkles' },
  { status: 'maintenance', icon: 'pi pi-wrench' },
  { status: 'overdue', icon: 'pi pi-exclamation-triangle' }
])

function getRoomStatusIcon(status) {
  return statusLegend.value.find(item => item.status === status)?.icon ?? 'pi pi-info-circle'
}

const statusFilterOptions = computed(() => [
  { label: t('front-desk.rooms.all'), value: 'all' },
  { label: t('front-desk.rooms.status.available'), value: 'available' },
  { label: t('front-desk.rooms.status.occupied'), value: 'occupied' },
  { label: t('front-desk.rooms.status.ending-soon'), value: 'endingSoon' },
  { label: t('front-desk.rooms.status.cleaning'), value: 'cleaning' },
  { label: t('front-desk.rooms.status.maintenance'), value: 'maintenance' },
  { label: t('front-desk.rooms.status.overdue'), value: 'overdue' }
])
const floorFilterOptions = computed(() => [
  { label: t('front-desk.rooms.all'), value: 'all' },
  ...floors.value.map(floor => ({ label: t('front-desk.rooms.floor-with-number', { floor }), value: floor }))
])
const typeFilterOptions = computed(() => [
  { label: t('front-desk.rooms.all'), value: 'all' },
  ...types.value.map(type => ({ label: type, value: type }))
])

const filteredRooms = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()
  return operationsStore.roomsWithDetails.filter(room => {
    const matchesSearch = !term || room.number.toLowerCase().includes(term)
    const matchesStatus = statusFilter.value === 'all' || room.runtimeStatus === statusFilter.value
    const matchesFloor = floorFilter.value === 'all' || Number(room.floor) === Number(floorFilter.value)
    const matchesType = typeFilter.value === 'all' || room.type === typeFilter.value
    return matchesSearch && matchesStatus && matchesFloor && matchesType
  })
})

function setRowFeedback(roomId, type, message) { rowFeedback[roomId] = { type, message } }
async function saveRoom() {
  const result = await operationsStore.createRoom(form)
  creationFeedback.value = { type: result.ok ? 'success' : 'error', message: result.message }
  if (result.ok) Object.assign(form, { number: '', floor: 1, type: 'Standard', capacity: 2, pricePerHour: 20, status: 'available' })
}
async function changeStatus(room, status) {
  const result = await operationsStore.updateRoomStatus(room.id, status)
  setRowFeedback(room.id, result.ok ? 'success' : 'error', result.message)
}
function startEdit(room) {
  editingRoomId.value = room.id
  Object.assign(editForm, { number: room.number, floor: Number(room.floor), type: room.type, capacity: Number(room.capacity), pricePerHour: Number(room.pricePerHour) })
}
function cancelEdit() { editingRoomId.value = null }
async function saveEdit(room) {
  const result = await operationsStore.updateRoom(room.id, editForm)
  setRowFeedback(room.id, result.ok ? 'success' : 'error', result.message)
  if (result.ok) editingRoomId.value = null
}
async function deleteRoom(room) {
  const result = await operationsStore.deleteRoom(room.id)
  setRowFeedback(room.id, result.ok ? 'success' : 'error', result.message)
}

function resolveFeedbackMessage(message) {
  return /^[a-z0-9.-]+$/.test(message ?? '') ? t(message) : message
}
</script>

<template>
  <section class="page-shell">
    <section class="page-header">
      <div><h1>{{ t('admin.rooms.title') }}</h1><p>{{ t('admin.rooms.subtitle') }}</p></div>
    </section>

    <article class="form-card admin-room-form-card">
      <div class="panel-header"><h2>{{ t('admin.rooms.new-room') }}</h2></div>
      <form class="form-grid admin-room-form" @submit.prevent="saveRoom">
        <div class="form-field"><label>{{ t('admin.rooms.number') }}</label><pv-input-text v-model="form.number" :placeholder="t('admin.rooms.number-placeholder')" /></div>
        <div class="form-field"><label>{{ t('admin.rooms.floor') }}</label><pv-input-number v-model="form.floor" :min="1" :use-grouping="false" input-id="room-floor" /></div>
        <div class="form-field"><label>{{ t('admin.rooms.type') }}</label><pv-select v-model="form.type" :options="roomTypeOptions" option-label="label" option-value="value" /></div>
        <div class="form-field"><label>{{ t('admin.rooms.capacity') }}</label><pv-input-number v-model="form.capacity" :min="1" :use-grouping="false" input-id="room-capacity" /></div>
        <div class="form-field"><label>{{ t('admin.rooms.price-per-hour-currency') }}</label><pv-input-number v-model="form.pricePerHour" prefix="S/ " :min="1" :min-fraction-digits="2" :max-fraction-digits="2" input-id="room-price" /></div>
        <div class="form-field"><label>{{ t('admin.rooms.initial-status') }}</label><pv-select v-model="form.status" :options="statusOptions" option-label="label" option-value="value" /></div>
        <div class="form-field submit-field"><button class="primary-button" type="submit"><i class="pi pi-plus"></i>{{ t('admin.rooms.register-room') }}</button></div>
      </form>
      <p v-if="creationFeedback.message" class="feedback slim-feedback" :class="creationFeedback.type">{{ resolveFeedbackMessage(creationFeedback.message) }}</p>
    </article>

    <article class="panel-card registered-rooms-panel">
      <div class="panel-header">
        <div>
          <h2>{{ t('admin.rooms.registered-rooms') }}</h2>
          <p class="help-message">{{ t('admin.rooms.registered-subtitle') }}</p>
        </div>
        <span class="room-badge">{{ filteredRooms.length }}</span>
      </div>

      <div class="admin-room-controls named-filters">
        <div class="filter-control wide">
          <label>{{ t('admin.rooms.search-label') }}</label>
          <div class="input-with-icon">
            <input v-model="searchTerm" type="text" :placeholder="t('admin.rooms.search-by-number-short')" />
            <button type="button" :aria-label="t('shared.actions.search')"><i class="pi pi-search"></i></button>
          </div>
        </div>
        <div class="filter-control"><label>{{ t('front-desk.rooms.floor') }}</label><pv-select v-model="floorFilter" :options="floorFilterOptions" option-label="label" option-value="value" /></div>
        <div class="filter-control"><label>{{ t('front-desk.rooms.type') }}</label><pv-select v-model="typeFilter" :options="typeFilterOptions" option-label="label" option-value="value" /></div>
        <div class="filter-control"><label>{{ t('front-desk.rooms.state') }}</label><pv-select v-model="statusFilter" :options="statusFilterOptions" option-label="label" option-value="value" /></div>
      </div>

      <section class="admin-room-status-legend" :aria-label="t('front-desk.rooms.state')">
        <span v-for="item in statusLegend" :key="item.status" class="admin-room-legend-item" :class="item.status">
          <i :class="item.icon"></i>
          {{ t('front-desk.rooms.status.' + toI18nKey(item.status)) }}
        </span>
      </section>

      <div class="admin-room-list">
        <article v-for="room in filteredRooms" :key="room.id" class="admin-room-row">
          <div>
            <strong>{{ t('admin.rooms.room-abbr') }} {{ room.number }}</strong>
            <small>{{ t('admin.rooms.floor') }} {{ room.floor }} · {{ room.type }} · S/ {{ Number(room.pricePerHour).toFixed(2) }}/h</small>
          </div>
          <div class="status-control-block">
            <template v-if="room.stayId">
              <span class="status-badge room-status-badge locked-status" :class="room.runtimeStatus"><i :class="getRoomStatusIcon(room.runtimeStatus)"></i>{{ t('front-desk.rooms.status.' + toI18nKey(room.runtimeStatus)) }}</span>
              <small class="locked-status-note">{{ t('admin.rooms.status-locked') }}</small>
            </template>
            <label v-else class="compact-select-label">
              <span class="status-badge room-status-badge" :class="room.runtimeStatus"><i :class="getRoomStatusIcon(room.runtimeStatus)"></i>{{ t('front-desk.rooms.status.' + toI18nKey(room.runtimeStatus)) }}</span>
              <span>{{ t('admin.rooms.update-status') }}</span>
              <pv-select
                :model-value="room.status"
                :options="statusOptions"
                option-label="label"
                option-value="value"
                @update:model-value="changeStatus(room, $event)"
              />
            </label>
            <p v-if="rowFeedback[room.id]?.message" class="inline-feedback" :class="rowFeedback[room.id].type">{{ resolveFeedbackMessage(rowFeedback[room.id].message) }}</p>
          </div>
          <div class="row-actions action-pair">
            <button class="mini-button edit-button" type="button" @click="startEdit(room)"><i class="pi pi-pencil"></i>{{ t('shared.actions.edit') }}</button>
            <button class="danger-ghost-button" type="button" @click="deleteRoom(room)"><i class="pi pi-trash"></i>{{ t('shared.actions.delete') }}</button>
          </div>

          <div v-if="editingRoomId === room.id" class="inline-edit-panel">
            <div class="inline-edit-grid">
              <div class="form-field"><label>{{ t('admin.rooms.number') }}</label><pv-input-text v-model="editForm.number" /></div>
              <div class="form-field"><label>{{ t('admin.rooms.floor') }}</label><pv-input-number v-model="editForm.floor" :min="1" :use-grouping="false" /></div>
              <div class="form-field"><label>{{ t('admin.rooms.type') }}</label><pv-select v-model="editForm.type" :options="roomTypeOptions" option-label="label" option-value="value" /></div>
              <div class="form-field"><label>{{ t('admin.rooms.capacity') }}</label><pv-input-number v-model="editForm.capacity" :min="1" :use-grouping="false" /></div>
              <div class="form-field"><label>{{ t('admin.rooms.price-per-hour-currency') }}</label><pv-input-number v-model="editForm.pricePerHour" prefix="S/ " :min="1" :min-fraction-digits="2" :max-fraction-digits="2" /></div>
              <div class="form-field submit-field">
                <div class="actions-row">
                  <button class="success-button" type="button" @click="saveEdit(room)"><i class="pi pi-check"></i>{{ t('shared.actions.save') }}</button>
                  <button class="ghost-button" type="button" @click="cancelEdit">{{ t('shared.actions.cancel') }}</button>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
    </article>
  </section>
</template>

<style scoped>
.admin-room-status-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  margin: 0 0 1rem;
}

.admin-room-legend-item,
.room-status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  border-radius: 999px;
  font-weight: 800;
}

.admin-room-legend-item {
  min-height: 32px;
  padding: 0.42rem 0.68rem;
  font-size: 0.77rem;
}

.room-status-badge {
  width: fit-content;
  min-height: 28px;
  padding: 0.38rem 0.62rem;
}

.room-status-badge.available,
.admin-room-legend-item.available { background: #dcfce7; color: #15803d; border: 1px solid #86efac; }
.room-status-badge.occupied,
.admin-room-legend-item.occupied { background: #dbeafe; color: #1d4ed8; border: 1px solid #93c5fd; }
.room-status-badge.endingSoon,
.admin-room-legend-item.endingSoon { background: #fef3c7; color: #b45309; border: 1px solid #fcd34d; }
.room-status-badge.cleaning,
.admin-room-legend-item.cleaning { background: #ccfbf1; color: #0f766e; border: 1px dashed #14b8a6; }
.room-status-badge.maintenance,
.admin-room-legend-item.maintenance { background: #f1f5f9; color: #475569; border: 1px solid #94a3b8; }
.room-status-badge.overdue,
.admin-room-legend-item.overdue { background: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5; }
.submit-field {
  justify-content: end;
}

.admin-room-form-card,
.registered-rooms-panel {
  margin-bottom: 1.25rem;
}

.admin-room-form {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: end;
}

.admin-room-form .submit-field {
  grid-column: 1 / -1;
}

.admin-room-controls {
  display: grid;
  grid-template-columns: minmax(280px, 1fr) repeat(3, minmax(150px, 190px));
  gap: 0.9rem;
  align-items: end;
  margin-bottom: 1rem;
}

.admin-room-row {
  display: grid;
  grid-template-columns: minmax(240px, 1fr) minmax(220px, 260px) auto;
  align-items: center;
  gap: 1rem;
}

.status-control-block {
  display: grid;
  gap: 0.25rem;
}

.locked-status {
  width: fit-content;
}

.locked-status-note {
  color: #64748b;
  font-size: 0.76rem;
}

.row-actions button {
  min-width: 112px;
}

@media (max-width: 1100px) {
  .admin-room-form,
  .admin-room-controls,
  .admin-room-row {
    grid-template-columns: 1fr;
  }
}
</style>
