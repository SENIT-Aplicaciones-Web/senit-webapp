<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import useSubscriptionsStore from '../../application/subscriptions.store.js'
import { formatDateTime } from '../../../shared/domain/services/date-format.service.js'
import { downloadTextPdf } from '../../../shared/infrastructure/pdf-receipt.service.js'

const { t } = useI18n()
const subscriptionsStore = useSubscriptionsStore()
const selectedPlan = ref(subscriptionsStore.currentPlan)
const exportFeedback = ref('')

const planOptions = computed(() => [
  { name: 'Basic', price: 29.99 },
  { name: 'Pro', price: 49.99 }
])

const currentPlan = computed(() =>
  planOptions.value.find(plan => plan.name === subscriptionsStore.currentPlan) ?? planOptions.value[0]
)

watch(currentPlan, plan => {
  selectedPlan.value = plan.name
})

async function savePlan() {
  await subscriptionsStore.updateSubscription(selectedPlan.value)
}

function exportPaymentHistory() {
  if (!subscriptionsStore.hasProPlan) {
    exportFeedback.value = t('subscription.pro-required')
    return
  }

  const lines = subscriptionsStore.paymentHistory.map(payment =>
    `${formatDateTime(payment.paidAt)} | ${payment.plan} | S/ ${Number(payment.amount).toFixed(2)} | ${t('subscription.completed')}`
  )

  downloadTextPdf({
    filename: `historial-suscripcion-${new Date().toISOString().slice(0, 10)}.pdf`,
    title: t('subscription.payment-history'),
    lines: lines.length ? lines : [t('subscription.no-payments')]
  })
  exportFeedback.value = t('subscription.export-ready')
}
</script>

<template>
  <section class="page-shell subscription-page">
    <section class="page-header">
      <div>
        <h1>{{ t('subscription.title') }}</h1>
        <p>{{ t('subscription.subtitle') }}</p>
      </div>
    </section>

    <section class="summary-grid compact-summary-grid subscription-summary">
      <article class="summary-card blue">
        <span>{{ t('subscription.current-plan') }}</span>
        <strong>{{ currentPlan.name }}</strong>
      </article>
      <article class="summary-card green">
        <span>{{ t('subscription.status') }}</span>
        <strong>{{ t('subscription.active') }}</strong>
      </article>
      <article class="summary-card purple">
        <span>{{ t('subscription.monthly-cost') }}</span>
        <strong>S/ {{ currentPlan.price }}</strong>
      </article>
      <article class="summary-card orange">
        <span>{{ t('subscription.payments') }}</span>
        <strong>{{ subscriptionsStore.paymentHistory.length }}</strong>
      </article>
    </section>

    <section class="grid-two subscription-grid">
      <article class="form-card">
        <div class="panel-header">
          <h2>{{ t('subscription.manage-plan') }}</h2>
        </div>
        <div class="form-field">
          <label>{{ t('subscription.plan-type') }}</label>
          <select v-model="selectedPlan">
            <option v-for="plan in planOptions" :key="plan.name" :value="plan.name">
              {{ plan.name }} · S/ {{ plan.price }} / {{ t('subscription.month') }}
            </option>
          </select>
        </div>
        <p class="help-message">{{ t('subscription.plan-affects-users') }}</p>
        <button class="primary-button subscription-save-button" type="button" @click="savePlan">
          <i class="pi pi-refresh"></i>{{ t('subscription.change-plan') }}
        </button>
      </article>

      <article class="panel-card">
        <div class="panel-header"><h2>{{ t('subscription.available-plans') }}</h2></div>
        <div class="subscription-plan-list simple-plan-list">
          <article v-for="plan in planOptions" :key="plan.name" class="subscription-plan-card simple-plan-card" :class="{ active: plan.name === currentPlan.name }">
            <span class="plan-label">{{ plan.name }}</span>
            <h3>{{ plan.name }}</h3>
            <strong>S/ {{ plan.price }} <small>/ {{ t('subscription.month') }}</small></strong>
          </article>
        </div>
      </article>
    </section>

    <section class="panel-card">
      <div class="panel-header payment-history-header">
        <div>
          <h2>{{ t('subscription.payment-history') }}</h2>
          <p class="help-message">{{ t('subscription.payment-history-description') }}</p>
        </div>
        <button class="secondary-button" type="button" :disabled="!subscriptionsStore.hasProPlan" @click="exportPaymentHistory">
          <i class="pi pi-file-pdf"></i>{{ t('shared.actions.export-pdf') }}
        </button>
      </div>
      <p v-if="!subscriptionsStore.hasProPlan" class="help-message">{{ t('subscription.pro-required') }}</p>
      <p v-if="exportFeedback" class="feedback success slim-feedback">{{ exportFeedback }}</p>
      <div class="table-wrapper no-horizontal-scroll">
        <table class="data-table compact-table">
          <thead>
            <tr>
              <th>{{ t('subscription.date') }}</th>
              <th>{{ t('subscription.plan') }}</th>
              <th>{{ t('subscription.amount') }}</th>
              <th>{{ t('subscription.payment-status') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="payment in subscriptionsStore.paymentHistory" :key="payment.id">
              <td>{{ formatDateTime(payment.paidAt) }}</td>
              <td>{{ payment.plan }}</td>
              <td>S/ {{ Number(payment.amount).toFixed(2) }}</td>
              <td><span class="status-badge paid">{{ t('subscription.completed') }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="!subscriptionsStore.paymentHistory.length" class="empty-state">
        <i class="pi pi-credit-card"></i>
        <h2>{{ t('subscription.no-payments') }}</h2>
      </div>
    </section>
  </section>
</template>

<style scoped>
.subscription-page { display: grid; gap: 1rem; }
.subscription-summary .summary-card strong { font-size: 1.7rem; }
.subscription-grid { align-items: start; }
.subscription-save-button { width: 100%; margin-top: 1rem; }
.subscription-plan-list { display: grid; gap: 1rem; }
.simple-plan-list { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.subscription-plan-card { padding: 1rem; border: 1px solid #dbe3ef; border-radius: 18px; background: #ffffff; }
.subscription-plan-card.active { border-color: #2563eb; background: #eef4ff; }
.plan-label { color: #2563eb; font-size: 0.78rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
.subscription-plan-card h3 { margin: 0.25rem 0; color: #1e3a8a; }
.subscription-plan-card strong { color: #0f172a; font-size: 1.4rem; }
.subscription-plan-card small { color: #64748b; font-size: 0.85rem; }
.payment-history-header { align-items: center; }
@media (max-width: 780px) { .simple-plan-list { grid-template-columns: 1fr; } }
</style>
