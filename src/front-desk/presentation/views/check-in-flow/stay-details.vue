<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const router = useRouter()
const route = useRoute()

const paymentMethod = ref('cash')

const guest = ref({
  name: 'Figma Senit',
  dni: '1234343',
  phone: '98239193',
  email: 'senit@recepcion.com'
})

const stay = ref({
  id: route.params.id,
  room: '301',
  stayAmount: 80,
  status: 'Por Pagar'
})

const consumptions = ref([
  {
    id: 1,
    name: 'Snacks',
    date: '12/05/2026, 14:24:12',
    amount: 5
  },
  {
    id: 2,
    name: 'Bebidas',
    date: '12/05/2026, 16:10:43',
    amount: 10.5
  }
])

const consumptionsTotal = computed(() => {
  return consumptions.value.reduce((total, item) => total + item.amount, 0)
})

const total = computed(() => {
  return stay.value.stayAmount + consumptionsTotal.value
})

function addConsumption() {
  consumptions.value.push({
    id: consumptions.value.length + 1,
    name: 'Nuevo consumo',
    date: new Date().toLocaleString('es-PE'),
    amount: 8
  })
}

function goToCheckout() {
  router.push({
    name: 'front-desk-stay-checkout',
    params: { id: stay.value.id }
  })
}

function goBack() {
  router.push({ name: 'front-desk-stays' })
}
</script>

<template>
  <section class="details-page">
    <header class="topbar">
      <div class="search-box">
        <input
            type="text"
            :placeholder="t('frontDesk.stayDetails.searchPlaceholder')"
        />
        <i class="pi pi-search"></i>
      </div>
    </header>

    <section class="title-section">
      <h1>{{ t('frontDesk.stayDetails.title') }}</h1>
    </section>

    <section class="details-card">
      <div class="info-grid">
        <article class="info-card">
          <h2>{{ t('frontDesk.stayDetails.guestInformation') }}</h2>

          <div class="info-list">
            <div>
              <span>{{ t('frontDesk.stayDetails.name') }}</span>
              <strong>{{ guest.name }}</strong>
            </div>

            <div>
              <span>{{ t('frontDesk.stayDetails.dni') }}</span>
              <strong>{{ guest.dni }}</strong>
            </div>

            <div>
              <span>{{ t('frontDesk.stayDetails.phone') }}</span>
              <strong>{{ guest.phone }}</strong>
            </div>

            <div>
              <span>{{ t('frontDesk.stayDetails.email') }}</span>
              <strong>{{ guest.email }}</strong>
            </div>
          </div>
        </article>

        <article class="info-card">
          <h2>{{ t('frontDesk.stayDetails.paymentSummary') }}</h2>

          <div class="payment-grid">
            <div>
              <span>{{ t('frontDesk.stayDetails.stay') }}</span>
              <strong>S/. {{ stay.stayAmount.toFixed(2) }}</strong>
            </div>

            <div>
              <span>{{ t('frontDesk.stayDetails.status') }}</span>
              <strong class="pending">
                {{ t('frontDesk.stayDetails.pendingPayment') }}
              </strong>
            </div>

            <div>
              <span>{{ t('frontDesk.stayDetails.consumptions') }}</span>
              <strong>S/. {{ consumptionsTotal.toFixed(2) }}</strong>
            </div>

            <div>
              <span>{{ t('frontDesk.stayDetails.total') }}</span>
              <strong>S/. {{ total.toFixed(2) }}</strong>
            </div>

            <div class="payment-method">
              <label for="payment-method">
                {{ t('frontDesk.stayDetails.paymentMethod') }}
              </label>

              <select id="payment-method" v-model="paymentMethod">
                <option value="cash">
                  {{ t('frontDesk.stayDetails.cash') }}
                </option>
                <option value="card">
                  {{ t('frontDesk.stayDetails.card') }}
                </option>
                <option value="transfer">
                  {{ t('frontDesk.stayDetails.transfer') }}
                </option>
                <option value="yape">
                  {{ t('frontDesk.stayDetails.yape') }}
                </option>
              </select>
            </div>
          </div>
        </article>
      </div>

      <article class="consumptions-card">
        <div class="consumptions-header">
          <h2>{{ t('frontDesk.stayDetails.additionalConsumptions') }}</h2>

          <button type="button" class="add-button" @click="addConsumption">
            <i class="pi pi-plus"></i>
            {{ t('frontDesk.stayDetails.add') }}
          </button>
        </div>

        <div class="consumption-list">
          <div
              v-for="item in consumptions"
              :key="item.id"
              class="consumption-item"
          >
            <div>
              <strong>{{ item.name }}</strong>
              <span>{{ item.date }}</span>
            </div>

            <strong>S/. {{ item.amount.toFixed(2) }}</strong>
          </div>
        </div>
      </article>

      <div class="button-row">
        <button class="checkout-button" type="button" @click="goToCheckout">
          {{ t('frontDesk.stayDetails.checkout') }}
        </button>

        <button class="back-button" type="button" @click="goBack">
          {{ t('frontDesk.stayDetails.back') }}
        </button>
      </div>
    </section>
  </section>
</template>

<style scoped>
.details-page {
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

.search-box input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  color: #0f172a;
  font-size: 1rem;
}

.search-box i {
  color: #1e3a8a;
}

.title-section h1 {
  margin: 0 0 1.5rem;
  color: #1e3a8a;
  font-size: 2.4rem;
  font-weight: 800;
}

.details-card {
  max-width: 980px;
  margin: 0 auto;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 22px;
  padding: 1.4rem;
  box-shadow: 0 16px 34px rgba(15, 23, 42, 0.08);
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.4rem;
  margin-bottom: 1.4rem;
}

.info-card,
.consumptions-card {
  border: 1px solid #dbe3ef;
  border-radius: 18px;
  padding: 1.3rem;
  background: #f8fafc;
}

.info-card h2,
.consumptions-card h2 {
  margin: 0 0 1.4rem;
  color: #0f172a;
  font-size: 1.2rem;
}

.info-list {
  display: grid;
  gap: 1.4rem;
}

.info-list div,
.payment-grid div {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-list span,
.payment-grid span,
.payment-method label {
  color: #0f172a;
  font-weight: 800;
  text-transform: uppercase;
}

.info-list strong,
.payment-grid strong {
  color: #64748b;
  font-weight: 600;
}

.payment-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.4rem;
}

.pending {
  color: #b45309 !important;
}

.payment-method {
  grid-column: 1 / -1;
}

.payment-method select {
  height: 42px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  background: #ffffff;
  color: #0f172a;
  padding: 0 0.9rem;
}

.consumptions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.add-button {
  border: none;
  border-radius: 13px;
  padding: 0.8rem 1.2rem;
  background: #2563eb;
  color: #ffffff;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-transform: uppercase;
}

.consumption-list {
  display: grid;
  gap: 0.8rem;
}

.consumption-item {
  background: #ffffff;
  border: 1px solid #dbe3ef;
  border-radius: 14px;
  padding: 0.9rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.consumption-item div {
  display: flex;
  flex-direction: column;
}

.consumption-item span {
  color: #64748b;
  font-size: 0.85rem;
}

.button-row {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.6rem;
}

.checkout-button,
.back-button {
  min-width: 180px;
  height: 48px;
  border: none;
  border-radius: 13px;
  color: #ffffff;
  font-weight: 800;
  cursor: pointer;
  text-transform: uppercase;
}

.checkout-button {
  background: #10b981;
}

.back-button {
  background: #475569;
}

@media (max-width: 900px) {
  .details-page {
    padding: 1rem;
  }

  .info-grid,
  .payment-grid {
    grid-template-columns: 1fr;
  }

  .button-row {
    flex-direction: column;
  }

  .checkout-button,
  .back-button {
    width: 100%;
  }
}
</style>
