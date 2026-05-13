<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

const { t } = useI18n()
const router = useRouter()

const searchTerm = ref('')

const alerts = ref([
  {
    id: 1,
    room: '196',
    guest: 'Figma Senit',
    floor: 'Piso 3',
    limitDate: '11/05/2026',
    time: '10:00:00',
    remainingTime: '00:23:02'
  },
  {
    id: 2,
    room: '421',
    guest: 'Senit Lopez',
    floor: 'Piso 2',
    limitDate: '11/05/2026',
    time: '10:50:20',
    remainingTime: '00:01:24'
  },
  {
    id: 3,
    room: '123',
    guest: 'Figma Paredes',
    floor: 'Piso 1',
    limitDate: '11/05/2026',
    time: '12:30:10',
    remainingTime: '00:13:22'
  }
])

const filteredAlerts = computed(() => {
  const term = searchTerm.value.toLowerCase()

  return alerts.value.filter(alert =>
      alert.guest.toLowerCase().includes(term) ||
      alert.room.toLowerCase().includes(term) ||
      alert.floor.toLowerCase().includes(term)
  )
})

function viewDetail(alert) {
  router.push({
    name: 'front-desk-stay-details',
    params: { id: alert.id }
  })
}
</script>

<template>
  <section class="alerts-page">
    <header class="topbar">
      <div class="search-box">
        <input
            type="text"
            :placeholder="t('frontDesk.alerts.globalSearch')"
        />
        <i class="pi pi-search"></i>
      </div>
    </header>

    <section class="title-section">
      <h1>{{ t('frontDesk.alerts.title') }}</h1>
      <p>{{ t('frontDesk.alerts.subtitle') }}</p>
    </section>

    <section class="alerts-card">
      <div class="alerts-header">
        <h2>
          {{ t('frontDesk.alerts.activeReservations') }}
          ({{ filteredAlerts.length }})
        </h2>

        <div class="name-search">
          <label>{{ t('frontDesk.alerts.searchByName') }}:</label>

          <div class="name-search-box">
            <input v-model="searchTerm" type="text" />
            <i class="pi pi-search"></i>
          </div>
        </div>
      </div>

      <div class="alerts-list">
        <article
            v-for="alert in filteredAlerts"
            :key="alert.id"
            class="alert-item"
        >
          <div class="room-title">
            <h3>
              {{ t('frontDesk.alerts.room') }} {{ alert.room }}
            </h3>
          </div>

          <div class="alert-data">
            <div>
              <span>{{ t('frontDesk.alerts.guest') }}:</span>
              <strong>{{ alert.guest }}</strong>
            </div>

            <div>
              <span>{{ t('frontDesk.alerts.location') }}:</span>
              <strong>{{ alert.floor }}</strong>
            </div>

            <div>
              <span>{{ t('frontDesk.alerts.limitDate') }}:</span>
              <strong>{{ alert.limitDate }}</strong>
            </div>

            <div>
              <span>{{ t('frontDesk.alerts.time') }}:</span>
              <strong>{{ alert.time }}</strong>
            </div>

            <div>
              <span>{{ t('frontDesk.alerts.remainingTime') }}:</span>
              <strong class="remaining">{{ alert.remainingTime }}</strong>
            </div>

            <button class="detail-button" @click="viewDetail(alert)">
              {{ t('frontDesk.alerts.viewDetail') }}
            </button>
          </div>
        </article>
      </div>

      <div v-if="!filteredAlerts.length" class="empty-state">
        <i class="pi pi-search"></i>
        <h2>{{ t('frontDesk.alerts.noResults') }}</h2>
      </div>
    </section>
  </section>
</template>

<style scoped>
.alerts-page {
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
  margin-bottom: 2rem;
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

.alerts-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 22px;
  padding: 1.4rem;
  box-shadow: 0 16px 34px rgba(15, 23, 42, 0.08);
}

.alerts-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.2rem;
}

.alerts-header h2 {
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

.alerts-list {
  display: grid;
  gap: 1rem;
}

.alert-item {
  border-radius: 18px;
  padding: 1rem 1.2rem;
  background: #f8fafc;
  border: 1px solid #dbe3ef;
  transition: 0.2s ease;
}

.alert-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
}

.room-title h3 {
  margin: 0 0 0.8rem;
  color: #0f172a;
  font-size: 1.2rem;
}

.alert-data {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 0.9fr 1.2fr auto;
  gap: 1rem;
  align-items: center;
}

.alert-data div {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.alert-data span {
  color: #0f172a;
  font-weight: 800;
}

.alert-data strong {
  color: #475569;
  font-weight: 500;
}

.remaining {
  color: #dc2626 !important;
  font-weight: 800 !important;
}

.detail-button {
  min-width: 150px;
  height: 46px;
  border: none;
  border-radius: 12px;
  background: #475569;
  color: #ffffff;
  font-weight: 800;
  cursor: pointer;
}

.detail-button:hover {
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
  .alert-data {
    grid-template-columns: repeat(2, 1fr);
  }

  .detail-button {
    width: 100%;
  }
}

@media (max-width: 760px) {
  .alerts-page {
    padding: 1rem;
  }

  .alerts-header,
  .name-search {
    flex-direction: column;
    align-items: stretch;
  }

  .name-search-box {
    width: 100%;
  }

  .alert-data {
    grid-template-columns: 1fr;
  }
}
</style>