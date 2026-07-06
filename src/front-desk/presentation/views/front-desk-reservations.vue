<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

const { t } = useI18n()
const router = useRouter()

const searchTerm = ref('')

const reservations = ref([
  {
    id: 1,
    guest: 'Juan Paredes',
    room: 'Habitación 242 - Piso 3',
    startDate: '20/05/2026',
    startTime: '14:00',
    endDate: '20/06/2026',
    endTime: '14:00'
  },
  {
    id: 2,
    guest: 'Juan Paredes',
    room: 'Habitación 142 - Piso 1',
    startDate: '20/06/2026',
    startTime: '11:00',
    endDate: '20/07/2026',
    endTime: '12:00'
  },
  {
    id: 3,
    guest: 'Juan Paredes',
    room: 'Habitación 21 - Piso 2',
    startDate: '20/08/2026',
    startTime: '19:00',
    endDate: '20/09/2026',
    endTime: '20:00'
  }
])

const filteredReservations = computed(() => {
  const term = searchTerm.value.toLowerCase()

  return reservations.value.filter(reservation =>
      reservation.guest.toLowerCase().includes(term) ||
      reservation.room.toLowerCase().includes(term)
  )
})

function goToNewReservation() {
  router.push({ name: 'front-desk-reservation-new' })
}

function cancelReservation(reservationId) {
  reservations.value = reservations.value.filter(
      reservation => reservation.id !== reservationId
  )
}
</script>

<template>
  <section class="reservations-page">
    <header class="topbar">
      <div class="search-box">
        <input
            type="text"
            :placeholder="t('frontDesk.reservations.globalSearch')"
        />
        <i class="pi pi-search"></i>
      </div>
    </header>

    <section class="title-section">
      <div>
        <h1>{{ t('frontDesk.reservations.title') }}</h1>
        <p>{{ t('frontDesk.reservations.subtitle') }}</p>
      </div>

      <button class="new-reservation-button" @click="goToNewReservation">
        <i class="pi pi-plus"></i>
        {{ t('frontDesk.reservations.newReservation') }}
      </button>
    </section>

    <section class="reservations-card">
      <div class="reservations-header">
        <h2>
          {{ t('frontDesk.reservations.activeReservations') }}
          ({{ filteredReservations.length }})
        </h2>

        <div class="name-search">
          <label>{{ t('frontDesk.reservations.searchByName') }}:</label>

          <div class="name-search-box">
            <input v-model="searchTerm" type="text" />
            <i class="pi pi-search"></i>
          </div>
        </div>
      </div>

      <div class="reservation-list">
        <article
            v-for="reservation in filteredReservations"
            :key="reservation.id"
            class="reservation-item"
        >
          <div class="reservation-name">
            <strong>{{ t('frontDesk.reservations.name') }}:</strong>
            <span>{{ reservation.guest }}</span>
          </div>

          <div class="reservation-data">
            <div>
              <strong>{{ t('frontDesk.reservations.location') }}:</strong>
              <span>{{ reservation.room }}</span>
            </div>

            <div>
              <strong>{{ t('frontDesk.reservations.startDate') }}:</strong>
              <span>{{ reservation.startDate }}</span>
            </div>

            <div>
              <strong>{{ t('frontDesk.reservations.startTime') }}:</strong>
              <span>{{ reservation.startTime }}</span>
            </div>

            <div>
              <strong>{{ t('frontDesk.reservations.endDate') }}:</strong>
              <span>{{ reservation.endDate }}</span>
            </div>

            <div>
              <strong>{{ t('frontDesk.reservations.endTime') }}:</strong>
              <span>{{ reservation.endTime }}</span>
            </div>

            <button
                class="cancel-button"
                @click="cancelReservation(reservation.id)"
            >
              {{ t('frontDesk.reservations.cancel') }}
            </button>
          </div>
        </article>
      </div>

      <div v-if="!filteredReservations.length" class="empty-state">
        <i class="pi pi-search"></i>
        <h2>{{ t('frontDesk.reservations.noResults') }}</h2>
      </div>
    </section>
  </section>
</template>

<style scoped>
.reservations-page {
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, #f8fbff 0%, #eef4ff 100%);
}

.topbar {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}

.search-box {
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

.search-box input,
.name-search-box input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  color: #0f172a;
  font-size: 1rem;
}

.search-box i,
.name-search-box i {
  color: #1e3a8a;
}

.title-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  color: #64748b;
  font-size: 1.05rem;
}

.new-reservation-button {
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
  text-transform: uppercase;
  font-size: 0.8rem;
}

.reservations-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 22px;
  padding: 1.4rem;
  box-shadow: 0 16px 34px rgba(15, 23, 42, 0.08);
}

.reservations-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.2rem;
}

.reservations-header h2 {
  margin: 0;
  color: #475569;
  font-size: 1.05rem;
  font-weight: 700;
}

.name-search {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  color: #64748b;
}

.name-search-box {
  width: 260px;
  height: 42px;
  background: #f8fafc;
  border: 1px solid #dbe3ef;
  border-radius: 12px;
  display: flex;
  align-items: center;
  padding: 0 0.8rem;
}

.reservation-list {
  display: grid;
  gap: 1rem;
}

.reservation-item {
  background: #f8fafc;
  border: 1px solid #dbe3ef;
  border-radius: 18px;
  padding: 1rem 1.2rem;
  transition: 0.2s ease;
}

.reservation-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
}

.reservation-name {
  display: flex;
  gap: 0.35rem;
  margin-bottom: 0.9rem;
  font-size: 1.05rem;
}

.reservation-name strong {
  color: #0f172a;
}

.reservation-name span {
  color: #334155;
}

.reservation-data {
  display: grid;
  grid-template-columns: 1.4fr 1fr 0.7fr 1fr 0.7fr auto;
  gap: 1rem;
  align-items: center;
}

.reservation-data div {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.reservation-data strong {
  color: #0f172a;
}

.reservation-data span {
  color: #475569;
}

.cancel-button {
  min-width: 140px;
  height: 46px;
  border: none;
  border-radius: 12px;
  background: #475569;
  color: #ffffff;
  font-weight: 800;
  cursor: pointer;
}

.cancel-button:hover {
  background: #334155;
}

.empty-state {
  min-height: 220px;
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
  .reservation-data {
    grid-template-columns: repeat(2, 1fr);
  }

  .cancel-button {
    width: 100%;
  }
}

@media (max-width: 760px) {
  .reservations-page {
    padding: 1rem;
  }

  .title-section,
  .reservations-header,
  .name-search {
    flex-direction: column;
    align-items: stretch;
  }

  .name-search-box {
    width: 100%;
  }

  .reservation-data {
    grid-template-columns: 1fr;
  }
}
</style>
