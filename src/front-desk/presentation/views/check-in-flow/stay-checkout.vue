<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const router = useRouter()

const paymentMethod = ref('cash')
const paymentConfirmed = ref(false)

const guest = ref({
  name: 'Figma Senit',
  dni: '1234343',
  phone: '98239193',
  email: 'senit@recepcion.com'
})

const stayAmount = ref(80)
const consumptionsAmount = ref(15.5)

const total = computed(() => stayAmount.value + consumptionsAmount.value)

function confirmPayment() {
  paymentConfirmed.value = true
  alert('Pago confirmado correctamente.')
}

function issueReceipt() {
  alert('Comprobante emitido correctamente.')
}

function exit() {
  router.push({ name: 'front-desk-stays' })
}
</script>

<template>
  <section class="checkout-page">
    <header class="topbar">
      <div class="search-box">
        <input
            type="text"
            :placeholder="t('frontDesk.checkout.searchPlaceholder')"
        />
        <i class="pi pi-search"></i>
      </div>
    </header>

    <section class="title-section">
      <h1>{{ t('frontDesk.checkout.title') }}</h1>
      <p>{{ t('frontDesk.checkout.subtitle') }}</p>
    </section>

    <section class="checkout-card">
      <div class="info-grid">
        <article class="info-card">
          <h2>{{ t('frontDesk.checkout.guestInformation') }}</h2>

          <div class="info-list">
            <div>
              <span>{{ t('frontDesk.checkout.name') }}</span>
              <strong>{{ guest.name }}</strong>
            </div>

            <div>
              <span>{{ t('frontDesk.checkout.dni') }}</span>
              <strong>{{ guest.dni }}</strong>
            </div>

            <div>
              <span>{{ t('frontDesk.checkout.phone') }}</span>
              <strong>{{ guest.phone }}</strong>
            </div>

            <div>
              <span>{{ t('frontDesk.checkout.email') }}</span>
              <strong>{{ guest.email }}</strong>
            </div>
          </div>
        </article>

        <article class="info-card">
          <h2>{{ t('frontDesk.checkout.paymentSummary') }}</h2>

          <div class="payment-grid">
            <div>
              <span>{{ t('frontDesk.checkout.stay') }}</span>
              <strong>S/. {{ stayAmount.toFixed(2) }}</strong>
            </div>

            <div>
              <span>{{ t('frontDesk.checkout.status') }}</span>
              <strong :class="paymentConfirmed ? 'paid' : 'pending'">
                {{
                  paymentConfirmed
                      ? t('frontDesk.checkout.paid')
                      : t('frontDesk.checkout.pendingPayment')
                }}
              </strong>
            </div>

            <div>
              <span>{{ t('frontDesk.checkout.consumptions') }}</span>
              <strong>S/. {{ consumptionsAmount.toFixed(2) }}</strong>
            </div>

            <div>
              <span>{{ t('frontDesk.checkout.total') }}</span>
              <strong class="total">S/. {{ total.toFixed(2) }}</strong>
            </div>

            <div class="payment-method">
              <label for="payment-method">
                {{ t('frontDesk.checkout.paymentMethod') }}
              </label>

              <select id="payment-method" v-model="paymentMethod">
                <option value="cash">
                  {{ t('frontDesk.checkout.cash') }}
                </option>
                <option value="card">
                  {{ t('frontDesk.checkout.card') }}
                </option>
                <option value="transfer">
                  {{ t('frontDesk.checkout.transfer') }}
                </option>
                <option value="yape">
                  {{ t('frontDesk.checkout.yape') }}
                </option>
              </select>
            </div>
          </div>
        </article>
      </div>

      <div class="button-row">
        <button class="confirm-button" type="button" @click="confirmPayment">
          {{ t('frontDesk.checkout.confirmPayment') }}
        </button>

        <button class="receipt-button" type="button" @click="issueReceipt">
          {{ t('frontDesk.checkout.issueReceipt') }}
        </button>

        <button class="exit-button" type="button" @click="exit">
          {{ t('frontDesk.checkout.exit') }}
        </button>
      </div>
    </section>
  </section>
</template>

<style scoped>
.checkout-page {
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

.title-section {
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

.checkout-card {
  max-width: 980px;
  margin: 0 auto;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 22px;
  padding: 1.8rem;
  box-shadow: 0 16px 34px rgba(15, 23, 42, 0.08);
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.8rem;
  margin-bottom: 2rem;
}

.info-card {
  border: 1px solid #dbe3ef;
  border-radius: 18px;
  padding: 1.4rem;
  background: #f8fafc;
}

.info-card h2 {
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

.pending {
  color: #b45309 !important;
}

.paid {
  color: #15803d !important;
}

.total {
  color: #1e3a8a !important;
  font-size: 1.2rem;
}

.button-row {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.confirm-button,
.receipt-button,
.exit-button {
  min-width: 180px;
  height: 50px;
  border: none;
  border-radius: 13px;
  font-weight: 800;
  cursor: pointer;
  text-transform: uppercase;
}

.confirm-button {
  background: #10b981;
  color: #ffffff;
}

.receipt-button {
  background: #2563eb;
  color: #ffffff;
}

.exit-button {
  background: #ffffff;
  color: #0f172a;
  border: 1px solid #475569;
}

@media (max-width: 900px) {
  .checkout-page {
    padding: 1rem;
  }

  .info-grid,
  .payment-grid {
    grid-template-columns: 1fr;
  }

  .button-row {
    flex-direction: column;
  }

  .confirm-button,
  .receipt-button,
  .exit-button {
    width: 100%;
  }
}
</style>
