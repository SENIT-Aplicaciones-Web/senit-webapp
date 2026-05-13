<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const searchTerm = ref('')

const stays = ref([
  {
    id: 1,
    room: '301',
    guest: 'Alex Thompson',
    checkIn: '13/05/26 02:00:20',
    checkOut: '14/05/26 02:00:20',
    status: 'active',
    amount: 180.00
  },
  {
    id: 2,
    room: '302',
    guest: 'Senit Martinez',
    checkIn: '10/05/26 18:00:20',
    checkOut: '17/05/26 18:00:20',
    status: 'active',
    amount: 420.00
  },
  {
    id: 3,
    room: '203',
    guest: 'L. Hamilton',
    checkIn: '13/05/26 08:30:00',
    checkOut: '13/05/26 20:30:00',
    status: 'endingSoon',
    amount: 95.00
  }
])

const filteredStays = computed(() => {
  return stays.value.filter(stay => {
    const term = searchTerm.value.toLowerCase()

    return (
        stay.room.toLowerCase().includes(term) ||
        stay.guest.toLowerCase().includes(term) ||
        t(`frontDesk.stays.status.${stay.status}`).toLowerCase().includes(term)
    )
  })
})

function checkoutStay(stay) {
  stay.status = 'finished'
}

function viewDetails(stay) {
  alert(`Detalle de estadía: Habitación ${stay.room} - ${stay.guest}`)
}
</script>

<template>
  <section class="stays-page">
    <header class="stays-topbar">
      <div class="global-search">
        <input
            v-model="searchTerm"
            type="text"
            :placeholder="t('frontDesk.stays.searchPlaceholder')"
        />
        <i class="pi pi-search"></i>
      </div>
    </header>

    <section class="title-section">
      <div>
        <h1>{{ t('frontDesk.stays.title') }}</h1>
        <p>{{ t('frontDesk.stays.subtitle') }}</p>
      </div>

      <button class="new-reservation-button">
        <i class="pi pi-plus"></i>
        {{ t('frontDesk.stays.newReservation') }}
      </button>
    </section>

    <section class="summary-grid">
      <article class="summary-card blue">
        <span>{{ t('frontDesk.stays.active') }}</span>
        <strong>12</strong>
      </article>

      <article class="summary-card green">
        <span>{{ t('frontDesk.stays.checkOutsToday') }}</span>
        <strong>08</strong>
      </article>

      <article class="summary-card orange">
        <span>{{ t('frontDesk.stays.endingSoon') }}</span>
        <strong>03</strong>
      </article>
    </section>

    <section class="filter-row">
      <label>{{ t('frontDesk.stays.searchGuest') }}:</label>

      <div class="guest-search">
        <input
            v-model="searchTerm"
            type="text"
        />
        <i class="pi pi-search"></i>
      </div>
    </section>

    <section class="stays-card">
      <table class="stays-table">
        <thead>
        <tr>
          <th>{{ t('frontDesk.stays.room') }}</th>
          <th>{{ t('frontDesk.stays.guest') }}</th>
          <th>{{ t('frontDesk.stays.checkIn') }}</th>
          <th>{{ t('frontDesk.stays.checkOut') }}</th>
          <th>{{ t('frontDesk.stays.statusLabel') }}</th>
          <th>{{ t('frontDesk.stays.amount') }}</th>
          <th>{{ t('frontDesk.stays.actions') }}</th>
        </tr>
        </thead>

        <tbody>
        <tr
            v-for="stay in filteredStays"
            :key="stay.id"
        >
          <td>
            <span class="room-badge">{{ stay.room }}</span>
          </td>

          <td>{{ stay.guest }}</td>
          <td>{{ stay.checkIn }}</td>
          <td>{{ stay.checkOut }}</td>

          <td>
              <span class="status-badge" :class="stay.status">
                {{ t(`frontDesk.stays.status.${stay.status}`) }}
              </span>
          </td>

          <td class="amount">
            S/ {{ stay.amount.toFixed(2) }}
          </td>

          <td>
            <div class="actions">
              <button
                  class="checkout-button"
                  :disabled="stay.status === 'finished'"
                  @click="checkoutStay(stay)"
              >
                {{ t('frontDesk.stays.checkOutAction') }}
              </button>

              <button
                  class="details-button"
                  @click="viewDetails(stay)"
              >
                {{ t('frontDesk.stays.viewDetail') }}
              </button>
            </div>
          </td>
        </tr>
        </tbody>
      </table>

      <div v-if="!filteredStays.length" class="empty-state">
        <i class="pi pi-search"></i>
        <h2>{{ t('frontDesk.stays.noResults') }}</h2>
      </div>
    </section>
  </section>
</template>

<style scoped>
.stays-page {
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, #f8fbff 0%, #eef4ff 100%);
}

.stays-topbar {
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

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 1.8rem;
}

.summary-card {
  border-radius: 20px;
  padding: 1.2rem;
  color: #ffffff;
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.12);
}

.summary-card span {
  display: block;
  text-transform: uppercase;
  font-size: 0.82rem;
  opacity: 0.95;
  margin-bottom: 0.5rem;
}

.summary-card strong {
  font-size: 2rem;
}

.summary-card.blue {
  background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
}

.summary-card.green {
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
}

.summary-card.orange {
  background: linear-gradient(135deg, #f97316 0%, #fb923c 100%);
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 1.2rem;
  color: #475569;
}

.filter-row label {
  font-weight: 600;
}

.guest-search {
  width: 280px;
  height: 42px;
  background: #ffffff;
  border: 1px solid #dbe3ef;
  border-radius: 12px;
  display: flex;
  align-items: center;
  padding: 0 0.9rem;
}

.guest-search input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  color: #0f172a;
}

.guest-search i {
  color: #64748b;
}

.stays-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 1rem;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
  overflow-x: auto;
}

.stays-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 0.9rem;
}

.stays-table th {
  text-align: left;
  padding: 0.8rem 1rem;
  color: #0f172a;
  font-size: 0.95rem;
  border-bottom: 1px solid #cbd5e1;
}

.stays-table td {
  background: #f8fafc;
  padding: 1rem;
  color: #334155;
}

.stays-table tbody tr td:first-child {
  border-radius: 14px 0 0 14px;
}

.stays-table tbody tr td:last-child {
  border-radius: 0 14px 14px 0;
}

.room-badge {
  display: inline-grid;
  place-items: center;
  min-width: 52px;
  height: 34px;
  border-radius: 10px;
  background: #dbeafe;
  color: #1d4ed8;
  font-weight: 800;
}

.status-badge {
  display: inline-block;
  min-width: 98px;
  text-align: center;
  padding: 0.45rem 0.75rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 800;
}

.status-badge.active {
  background: #dcfce7;
  color: #15803d;
}

.status-badge.endingSoon {
  background: #fef3c7;
  color: #b45309;
}

.status-badge.finished {
  background: #e2e8f0;
  color: #475569;
}

.amount {
  font-weight: 800;
  color: #0f172a !important;
}

.actions {
  display: flex;
  gap: 0.7rem;
}

.checkout-button,
.details-button {
  border: none;
  border-radius: 10px;
  padding: 0.7rem 0.95rem;
  color: #ffffff;
  font-weight: 800;
  cursor: pointer;
  font-size: 0.78rem;
}

.checkout-button {
  background: #10b981;
}

.checkout-button:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}

.details-button {
  background: #475569;
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

@media (max-width: 900px) {
  .title-section {
    flex-direction: column;
    align-items: flex-start;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .filter-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .guest-search {
    width: 100%;
  }
}
</style>