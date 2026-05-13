<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const searchTerm = ref('')
const floorFilter = ref('all')
const typeFilter = ref('all')
const statusFilter = ref('all')

const rooms = ref([
  { number: 101, floor: 1, type: 'Standard', status: 'available', guest: '' },
  { number: 102, floor: 1, type: 'Standard', status: 'occupied', guest: 'M. Rodríguez' },
  { number: 103, floor: 1, type: 'Suite', status: 'cleaning', guest: '' },
  { number: 104, floor: 1, type: 'Standard', status: 'occupied', guest: 'J. Doe' },
  { number: 105, floor: 1, type: 'Standard', status: 'blocked', guest: 'Fuera de servicio' },
  { number: 106, floor: 1, type: 'Standard', status: 'available', guest: '' },
  { number: 107, floor: 1, type: 'Standard', status: 'available', guest: '' },
  { number: 108, floor: 1, type: 'Suite', status: 'occupied', guest: 'A. Smith' },

  { number: 201, floor: 2, type: 'Deluxe', status: 'available', guest: '' },
  { number: 202, floor: 2, type: 'Deluxe', status: 'available', guest: '' },
  { number: 203, floor: 2, type: 'Suite', status: 'occupied', guest: 'L. Hamilton' },
  { number: 204, floor: 2, type: 'Deluxe', status: 'cleaning', guest: '' },

  { number: 301, floor: 3, type: 'Suite', status: 'maintenance', guest: 'Mantenimiento AC' },
  { number: 302, floor: 3, type: 'Standard', status: 'available', guest: '' },
  { number: 303, floor: 3, type: 'Deluxe', status: 'occupied', guest: 'C. Evans' },
  { number: 304, floor: 3, type: 'Standard', status: 'blocked', guest: 'Bloqueada' }
])

const floors = computed(() => {
  return [...new Set(rooms.value.map(room => room.floor))]
})

const filteredRooms = computed(() => {
  return rooms.value.filter(room => {
    const matchesSearch =
        String(room.number).includes(searchTerm.value) ||
        room.type.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
        room.guest.toLowerCase().includes(searchTerm.value.toLowerCase())

    const matchesFloor =
        floorFilter.value === 'all' || room.floor === Number(floorFilter.value)

    const matchesType =
        typeFilter.value === 'all' || room.type === typeFilter.value

    const matchesStatus =
        statusFilter.value === 'all' || room.status === statusFilter.value

    return matchesSearch && matchesFloor && matchesType && matchesStatus
  })
})

const roomsByFloor = computed(() => {
  const grouped = {}

  filteredRooms.value.forEach(room => {
    if (!grouped[room.floor]) grouped[room.floor] = []
    grouped[room.floor].push(room)
  })

  return Object.entries(grouped).map(([floor, floorRooms]) => ({
    floor: Number(floor),
    rooms: floorRooms
  }))
})

function getStatusLabel(status) {
  return t(`frontDesk.rooms.status.${status}`)
}
</script>

<template>
  <section class="rooms-page">
    <header class="rooms-topbar">
      <div class="global-search">
        <input
            v-model="searchTerm"
            type="text"
            :placeholder="t('frontDesk.rooms.searchPlaceholder')"
        />
        <i class="pi pi-search"></i>
      </div>
    </header>

    <section class="title-section">
      <div>
        <h1>{{ t('frontDesk.rooms.title') }}</h1>
        <p>{{ t('frontDesk.rooms.subtitle') }}</p>
      </div>

      <button class="new-room-button">
        <i class="pi pi-plus"></i>
        {{ t('frontDesk.rooms.newReservation') }}
      </button>
    </section>

    <section class="filters-card">
      <div class="filter-group">
        <label>{{ t('frontDesk.rooms.floor') }}</label>
        <select v-model="floorFilter">
          <option value="all">{{ t('frontDesk.rooms.all') }}</option>
          <option v-for="floor in floors" :key="floor" :value="floor">
            Piso {{ floor }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label>{{ t('frontDesk.rooms.type') }}</label>
        <select v-model="typeFilter">
          <option value="all">{{ t('frontDesk.rooms.all') }}</option>
          <option value="Standard">Standard</option>
          <option value="Deluxe">Deluxe</option>
          <option value="Suite">Suite</option>
        </select>
      </div>

      <div class="filter-group">
        <label>{{ t('frontDesk.rooms.state') }}</label>
        <select v-model="statusFilter">
          <option value="all">{{ t('frontDesk.rooms.all') }}</option>
          <option value="occupied">{{ t('frontDesk.rooms.status.occupied') }}</option>
          <option value="available">{{ t('frontDesk.rooms.status.available') }}</option>
          <option value="blocked">{{ t('frontDesk.rooms.status.blocked') }}</option>
          <option value="cleaning">{{ t('frontDesk.rooms.status.cleaning') }}</option>
          <option value="maintenance">{{ t('frontDesk.rooms.status.maintenance') }}</option>
        </select>
      </div>

      <div class="legend">
        <div class="legend-item">
          <span class="status-dot occupied"></span>
          {{ t('frontDesk.rooms.status.occupied') }}
        </div>

        <div class="legend-item">
          <span class="status-dot available"></span>
          {{ t('frontDesk.rooms.status.available') }}
        </div>

        <div class="legend-item">
          <span class="status-dot blocked"></span>
          {{ t('frontDesk.rooms.status.blocked') }}
        </div>

        <div class="legend-item">
          <span class="status-dot cleaning"></span>
          {{ t('frontDesk.rooms.status.cleaning') }}
        </div>

        <div class="legend-item">
          <span class="status-dot maintenance"></span>
          {{ t('frontDesk.rooms.status.maintenance') }}
        </div>
      </div>
    </section>

    <section
        v-for="floorGroup in roomsByFloor"
        :key="floorGroup.floor"
        class="floor-section"
    >
      <div class="floor-header">
        <h2>PISO {{ String(floorGroup.floor).padStart(2, '0') }}</h2>
        <span>{{ floorGroup.rooms.length }} HAB</span>
      </div>

      <div class="rooms-grid">
        <article
            v-for="room in floorGroup.rooms"
            :key="room.number"
            class="room-card"
            :class="room.status"
        >
          <div class="room-header">
            <strong>{{ room.number }}</strong>
            <i class="pi pi-circle"></i>
          </div>

          <p class="room-type">{{ room.type }}</p>

          <p class="room-guest">
            {{ room.guest || getStatusLabel(room.status) }}
          </p>

          <span class="room-status">
            {{ getStatusLabel(room.status) }}
          </span>
        </article>
      </div>
    </section>

    <section v-if="!roomsByFloor.length" class="empty-state">
      <i class="pi pi-search"></i>
      <h2>{{ t('frontDesk.rooms.noResults') }}</h2>
    </section>
  </section>
</template>

<style scoped>
.rooms-page {
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, #f8fbff 0%, #eef4ff 100%);
}

.rooms-topbar {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}

.global-search {
  width: min(780px, 100%);
  height: 46px;
  background: #ffffff;
  border: 1px solid #dbe3ef;
  border-radius: 14px;
  display: flex;
  align-items: center;
  padding: 0 1rem;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.05);
}

.global-search input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  color: #0f172a;
  font-size: 1rem;
}

.global-search i {
  color: #1e3a8a;
  font-size: 1.1rem;
}

.title-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.title-section h1 {
  margin: 0;
  color: #1e3a8a;
  font-size: 2.4rem;
  font-weight: 800;
}

.title-section p {
  margin: 0.35rem 0 0;
  color: #475569;
  font-size: 1.05rem;
}

.new-room-button {
  border: none;
  border-radius: 14px;
  padding: 0.95rem 1.2rem;
  color: #ffffff;
  font-weight: 800;
  cursor: pointer;
  background: linear-gradient(90deg, #2563eb 0%, #3b82f6 100%);
  box-shadow: 0 10px 20px rgba(37, 99, 235, 0.22);
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.filters-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 1.3rem;
  margin-bottom: 2rem;
  display: grid;
  grid-template-columns: repeat(3, 160px) 1fr;
  gap: 1.2rem;
  align-items: end;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.filter-group label {
  color: #0f172a;
  font-weight: 800;
  font-size: 0.95rem;
}

.filter-group select {
  height: 42px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  background: #f8fafc;
  color: #0f172a;
  padding: 0 0.8rem;
  outline: none;
}

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  border-left: 1px solid #e2e8f0;
  padding-left: 1.2rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.8rem;
  font-weight: 700;
  color: #334155;
  text-transform: uppercase;
}

.status-dot {
  width: 14px;
  height: 14px;
  border-radius: 999px;
  display: inline-block;
}

.status-dot.occupied {
  background: #111827;
}

.status-dot.available {
  background: #ffffff;
  border: 2px solid #94a3b8;
}

.status-dot.blocked {
  background: #94a3b8;
}

.status-dot.cleaning {
  background: #ffffff;
  border: 2px dashed #10b981;
}

.status-dot.maintenance {
  background: #f59e0b;
}

.floor-section {
  margin-bottom: 2.2rem;
}

.floor-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.2rem;
}

.floor-header h2 {
  margin: 0;
  font-size: 1.7rem;
  color: #0f172a;
  font-weight: 800;
}

.floor-header span {
  padding: 0.42rem 1.2rem;
  border-radius: 999px;
  background: #ffffff;
  color: #1e3a8a;
  border: 1px solid #cbd5e1;
  font-weight: 800;
  font-size: 0.82rem;
}

.rooms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(118px, 1fr));
  gap: 1rem;
}

.room-card {
  min-height: 126px;
  border-radius: 18px;
  padding: 0.9rem;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.06);
  transition: 0.2s ease;
  position: relative;
  overflow: hidden;
}

.room-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 28px rgba(15, 23, 42, 0.12);
}

.room-card.occupied {
  background: linear-gradient(135deg, #111827 0%, #1f2937 100%);
  color: #ffffff;
  border-color: #111827;
}

.room-card.available {
  background: #ffffff;
}

.room-card.blocked {
  background: #f1f5f9;
  color: #475569;
}

.room-card.cleaning {
  background: #ffffff;
  border: 2px dashed #10b981;
}

.room-card.maintenance {
  background: #fffbeb;
  border-color: #f59e0b;
}

.room-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.room-header strong {
  font-size: 1.1rem;
}

.room-header i {
  font-size: 0.7rem;
  opacity: 0.7;
}

.room-type {
  margin: 0.8rem 0 0;
  font-size: 0.8rem;
  font-weight: 700;
}

.room-guest {
  margin: 0.35rem 0 0;
  font-size: 0.74rem;
  opacity: 0.8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.room-status {
  position: absolute;
  left: 0.7rem;
  right: 0.7rem;
  bottom: 0.65rem;
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
  opacity: 0.8;
}

.empty-state {
  min-height: 260px;
  display: grid;
  place-content: center;
  text-align: center;
  color: #64748b;
}

.empty-state i {
  font-size: 2rem;
  margin-bottom: 1rem;
}

@media (max-width: 1100px) {
  .filters-card {
    grid-template-columns: repeat(3, 1fr);
  }

  .legend {
    grid-column: 1 / -1;
    border-left: none;
    border-top: 1px solid #e2e8f0;
    padding-left: 0;
    padding-top: 1rem;
  }
}

@media (max-width: 720px) {
  .rooms-page {
    padding: 1rem;
  }

  .title-section {
    flex-direction: column;
    align-items: flex-start;
  }

  .filters-card {
    grid-template-columns: 1fr;
  }

  .rooms-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>