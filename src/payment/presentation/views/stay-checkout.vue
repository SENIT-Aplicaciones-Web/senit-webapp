<script setup>
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { toI18nKey } from '../../../shared/application/locale-key.js'
import usePaymentsStore from '../../application/payments.store.js'
import { downloadTextPdf } from '../../../shared/infrastructure/pdf-receipt.service.js'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const paymentsStore = usePaymentsStore()
const stay = computed(() => paymentsStore.getStayById(route.params.id))
const paymentMethod = ref(stay.value?.paymentMethod ?? 'cash')
const feedback = ref({ type: '', message: '' })
const consumptionFeedback = ref({ type: '', message: '' })
const showConsumptionForm = ref(false)
const editingConsumptionId = ref(null)
const consumptionForm = reactive({ description: '', quantity: 1, unitPrice: 0 })
const consumptionEditForm = reactive({ description: '', quantity: 1, unitPrice: 0 })
const canModifyConsumptions = computed(() => stay.value && stay.value.status !== 'finished' && stay.value.paymentStatus !== 'paid')
const isAddingConsumption = ref(false)
const editingConsumptionBusyId = ref(null)
const deletingConsumptionId = ref(null)
const isConfirmingPayment = ref(false)
const isIssuingReceipt = ref(false)

function isAdminRoute() { return route.path.startsWith('/admin') }
function goBack() {
  const from = route.query.from
  if (from === 'rooms') router.push({ name: isAdminRoute() ? 'admin-rooms' : 'front-desk-rooms' })
  else if (from === 'alerts') router.push({ name: isAdminRoute() ? 'admin-alerts' : 'front-desk-alerts' })
  else if (from === 'dashboard') router.push({ name: isAdminRoute() ? 'admin-dashboard' : 'front-desk-dashboard' })
  else router.push({ name: isAdminRoute() ? 'admin-stays' : 'front-desk-stays' })
}
function resetConsumptionForm() { Object.assign(consumptionForm, { description: '', quantity: 1, unitPrice: 0 }) }

async function addConsumption() {
  if (isAddingConsumption.value) return
  consumptionFeedback.value = { type: '', message: '' }
  if (!canModifyConsumptions.value) {
    consumptionFeedback.value = { type: 'error', message: t('front-desk.checkout.paid-consumption-locked') }
    return
  }
  isAddingConsumption.value = true
  try {
    const result = await paymentsStore.addConsumption(route.params.id, consumptionForm)
    consumptionFeedback.value = { type: result.ok ? 'success' : 'error', message: result.message }
    if (!result.ok) return
    resetConsumptionForm()
    showConsumptionForm.value = false
  } finally {
    isAddingConsumption.value = false
  }
}

function startConsumptionEdit(consumption) {
  if (!canModifyConsumptions.value) return
  editingConsumptionId.value = consumption.id
  Object.assign(consumptionEditForm, {
    description: consumption.description,
    quantity: Number(consumption.quantity),
    unitPrice: Number(consumption.unitPrice)
  })
}

function cancelConsumptionEdit() {
  editingConsumptionId.value = null
}

async function saveConsumptionEdit(consumption) {
  if (editingConsumptionBusyId.value) return
  editingConsumptionBusyId.value = consumption.id
  try {
    const result = await paymentsStore.updateConsumption(consumption.id, consumptionEditForm)
    consumptionFeedback.value = { type: result.ok ? 'success' : 'error', message: result.message }
    if (result.ok) editingConsumptionId.value = null
  } finally {
    editingConsumptionBusyId.value = null
  }
}

async function removeConsumption(consumption) {
  if (!canModifyConsumptions.value || deletingConsumptionId.value) return
  deletingConsumptionId.value = consumption.id
  try {
    const result = await paymentsStore.deleteConsumption(consumption.id)
    consumptionFeedback.value = { type: result.ok ? 'success' : 'error', message: result.message }
  } finally {
    deletingConsumptionId.value = null
  }
}

async function confirmPayment() {
  if (isConfirmingPayment.value) return
  feedback.value = { type: '', message: '' }
  isConfirmingPayment.value = true
  try {
    const result = await paymentsStore.confirmPayment(route.params.id, paymentMethod.value)
    feedback.value = { type: result.ok ? 'success' : 'error', message: result.message }
  } finally {
    isConfirmingPayment.value = false
  }
}

async function issueReceipt() {
  if (isIssuingReceipt.value) return
  feedback.value = { type: '', message: '' }
  isIssuingReceipt.value = true
  let result
  try {
    result = await paymentsStore.issueInvoiceAndFinishStay(route.params.id)
    feedback.value = { type: result.ok ? 'success' : 'error', message: result.message }
    if (!result.ok) return
  } finally {
    isIssuingReceipt.value = false
  }

  const completedStay = result.stay
  downloadTextPdf({
    filename: `comprobante-${result.invoice.number}.pdf`,
    title: t('front-desk.checkout.receipt-title', { number: result.invoice.number }),
    lines: [
      `${t('front-desk.checkout.receipt-hotel')}: ${paymentsStore.activeHotel?.name ?? t('brand.default-hotel')}`,
      `${t('front-desk.checkout.receipt-guest')}: ${completedStay.guest.fullName}`,
      `${t('front-desk.stay-details.dni')}: ${completedStay.guest.dni}`,
      `${t('front-desk.checkout.receipt-room')}: ${completedStay.room?.number}`,
      `${t('front-desk.common.entry')}: ${completedStay.formattedCheckIn}`,
      `${t('front-desk.checkout.receipt-limit')}: ${completedStay.formattedCheckOut}`,
      `${t('front-desk.checkout.receipt-real-checkout')}: ${completedStay.checkedOutLabel}`,
      `${t('front-desk.checkout.receipt-stay')}: S/ ${completedStay.initialAmount.toFixed(2)}`,
      completedStay.prepaidAmount > 0 ? `${t('front-desk.checkout.receipt-reservation-prepaid')}: - S/ ${completedStay.prepaidAmount.toFixed(2)}` : '',
      `${t('front-desk.checkout.receipt-consumptions')}: S/ ${completedStay.consumptionsTotal.toFixed(2)}`,
      `${t('front-desk.checkout.receipt-total-paid')}: S/ ${completedStay.total.toFixed(2)}`,
      `${t('front-desk.checkout.receipt-payment-method')}: ${paymentMethod.value}`,
      `${t('front-desk.common.status')}: ${t('front-desk.checkout.receipt-status-finished')}`
    ].filter(Boolean)
  })
}

function resolveFeedbackMessage(message) {
  return /^[a-z0-9.-]+$/.test(message ?? '') ? t(message) : message
}
</script>

<template>
  <section class="page-shell" v-if="stay">
    <section class="toolbar-card checkout-back-toolbar">
      <button class="ghost-button" type="button" @click="goBack"><i class="pi pi-arrow-left"></i>{{ t('front-desk.checkout.exit') }}</button>
    </section>

    <section class="page-header checkout-header">
      <div><h1>{{ t('front-desk.checkout.title') }}</h1><p>{{ t('front-desk.checkout.subtitle') }}</p></div>
      <span class="status-badge" :class="stay.status">{{ t('front-desk.stay-status.' + toI18nKey(stay.status)) }}</span>
    </section>

    <section class="grid-two checkout-layout checkout-main-grid">
      <article class="form-card checkout-info-card">
        <div class="panel-header"><h2>{{ t('front-desk.checkout.guest-information') }}</h2></div>
        <div class="form-grid checkout-info-grid">
          <div class="form-field"><label>{{ t('front-desk.checkout.name') }}</label><input :value="stay.guest.fullName" disabled /></div>
          <div class="form-field"><label>{{ t('front-desk.checkout.dni') }}</label><input :value="stay.guest.dni" disabled /></div>
          <div class="form-field"><label>{{ t('front-desk.checkout.phone') }}</label><input :value="stay.guest.phone" disabled /></div>
          <div class="form-field"><label>{{ t('front-desk.checkout.email') }}</label><input :value="stay.guest.email" disabled /></div>
          <div class="form-field full"><label>{{ t('front-desk.checkout.stay') }}</label><input :value="`${stay.formattedCheckIn} - ${stay.formattedCheckOut}`" disabled /></div>
          <div class="form-field"><label>{{ t('front-desk.checkout.status') }}</label><input :value="t('front-desk.stay-status.' + toI18nKey(stay.status))" disabled /></div>
        </div>
      </article>

      <article class="form-card checkout-payment-card">
        <div class="panel-header"><h2>{{ t('front-desk.checkout.payment-summary') }}</h2></div>
        <div class="result-list payment-summary-list">
          <div class="result-item"><span>{{ t('front-desk.checkout.stay') }} <small>{{ stay.hours }} {{ t('shared.states.hours') }}</small></span><strong>S/ {{ stay.initialAmount.toFixed(2) }}</strong></div>
          <div v-if="stay.prepaidAmount > 0" class="result-item prepaid-line"><span>{{ t('front-desk.checkout.reservation-prepaid') }} <small>{{ t('front-desk.checkout.reservation-prepaid-help') }}</small></span><strong>- S/ {{ stay.prepaidAmount.toFixed(2) }}</strong></div>
          <div class="result-item"><span>{{ t('front-desk.checkout.consumptions') }} <small>{{ t('front-desk.stay-details.registered-count', { count: stay.consumptions.length }) }}</small></span><strong>S/ {{ stay.consumptionsTotal.toFixed(2) }}</strong></div>
          <div class="result-item"><span>{{ t('front-desk.checkout.total') }} <small>{{ t('front-desk.checkout.final-amount') }}</small></span><strong>S/ {{ stay.total.toFixed(2) }}</strong></div>
          <div class="result-item"><span>{{ t('front-desk.checkout.payment-status') }} <small>{{ t('front-desk.payment-status.' + toI18nKey(stay.paymentStatus)) }}</small></span><span class="status-badge" :class="stay.paymentStatus === 'paid' ? 'paid' : 'pending'">{{ t('front-desk.payment-status.' + toI18nKey(stay.paymentStatus)) }}</span></div>
        </div>
        <p class="payment-help">{{ t('front-desk.checkout.payment-process-help') }}</p>
        <div class="form-field checkout-payment-method">
          <label>{{ t('front-desk.checkout.payment-method') }}</label>
          <select v-model="paymentMethod" :disabled="stay.status === 'finished' || isConfirmingPayment || isIssuingReceipt">
            <option value="cash">{{ t('front-desk.checkout.cash') }}</option>
            <option value="card">{{ t('front-desk.checkout.card') }}</option>
            <option value="transfer">{{ t('front-desk.checkout.transfer') }}</option>
            <option value="yape">{{ t('front-desk.checkout.yape') }}</option>
          </select>
        </div>
        <p v-if="feedback.message" class="feedback" :class="feedback.type">{{ resolveFeedbackMessage(feedback.message) }}</p>
        <div class="actions-row checkout-actions-row">
          <button class="success-button checkout-action" type="button" :disabled="stay.status === 'finished' || stay.paymentStatus === 'paid' || isConfirmingPayment || isIssuingReceipt" @click="confirmPayment"><i class="pi pi-check"></i>{{ t('front-desk.checkout.confirm-payment') }}</button>
          <button class="primary-button checkout-action" type="button" :disabled="stay.status === 'finished' || isConfirmingPayment || isIssuingReceipt" @click="issueReceipt"><i class="pi pi-file-pdf"></i>{{ t('front-desk.checkout.issue-receipt') }}</button>
        </div>
      </article>
    </section>

    <section class="panel-card checkout-consumptions-card">
      <div class="panel-header">
        <h2>{{ t('front-desk.stay-details.additional-consumptions') }}</h2>
        <button class="secondary-button" type="button" :disabled="!canModifyConsumptions || isAddingConsumption" @click="showConsumptionForm = !showConsumptionForm"><i class="pi pi-plus"></i>{{ t('front-desk.stay-details.add') }}</button>
      </div>

      <p v-if="!canModifyConsumptions" class="help-message locked-consumption-message">{{ t('front-desk.checkout.paid-consumption-locked') }}</p>
      <form v-if="showConsumptionForm && canModifyConsumptions" class="form-grid consumption-form-grid" @submit.prevent="addConsumption">
        <div class="form-field"><label>{{ t('front-desk.stay-details.product-or-service') }}</label><input v-model="consumptionForm.description" type="text" :placeholder="t('front-desk.stay-details.consumption-placeholder')" /></div>
        <div class="form-field"><label>{{ t('front-desk.common.quantity') }}</label><input v-model.number="consumptionForm.quantity" min="1" type="number" /></div>
        <div class="form-field"><label>{{ t('front-desk.stay-details.unit-price') }}</label><input v-model.number="consumptionForm.unitPrice" min="0" step="0.1" type="number" /></div>
        <div class="form-field submit-field"><button class="success-button" type="submit" :disabled="isAddingConsumption"><i class="pi pi-check"></i>{{ t('front-desk.stay-details.save-consumption') }}</button></div>
      </form>
      <p v-if="consumptionFeedback.message" class="feedback" :class="consumptionFeedback.type">{{ resolveFeedbackMessage(consumptionFeedback.message) }}</p>

      <div class="table-wrapper no-horizontal-scroll">
        <table class="data-table compact-table consumptions-table">
          <thead><tr><th>{{ t('front-desk.common.description') }}</th><th>{{ t('front-desk.common.quantity') }}</th><th>{{ t('front-desk.common.price') }}</th><th>{{ t('front-desk.common.subtotal') }}</th><th>{{ t('front-desk.common.actions') }}</th></tr></thead>
          <tbody>
            <tr v-for="consumption in stay.consumptions" :key="consumption.id">
              <template v-if="editingConsumptionId === consumption.id">
                <td><input v-model="consumptionEditForm.description" class="table-input" /></td>
                <td><input v-model.number="consumptionEditForm.quantity" min="1" type="number" class="table-input small" /></td>
                <td><input v-model.number="consumptionEditForm.unitPrice" min="0" step="0.1" type="number" class="table-input small" /></td>
                <td>S/ {{ (Number(consumptionEditForm.quantity) * Number(consumptionEditForm.unitPrice)).toFixed(2) }}</td>
                <td class="actions"><div class="actions-row"><button class="success-button icon-action" type="button" :disabled="editingConsumptionBusyId === consumption.id" @click="saveConsumptionEdit(consumption)"><i class="pi pi-check"></i></button><button class="ghost-button icon-action" type="button" @click="cancelConsumptionEdit"><i class="pi pi-times"></i></button></div></td>
              </template>
              <template v-else>
                <td>{{ consumption.description }}</td>
                <td>{{ consumption.quantity }}</td>
                <td>S/ {{ Number(consumption.unitPrice).toFixed(2) }}</td>
                <td>S/ {{ (Number(consumption.quantity) * Number(consumption.unitPrice)).toFixed(2) }}</td>
                <td class="actions"><div class="actions-row"><button class="mini-button icon-action" type="button" :disabled="!canModifyConsumptions" @click="startConsumptionEdit(consumption)"><i class="pi pi-pencil"></i></button><button class="danger-ghost-button icon-action" type="button" :disabled="!canModifyConsumptions || deletingConsumptionId === consumption.id" @click="removeConsumption(consumption)"><i class="pi pi-trash"></i></button></div></td>
              </template>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="!stay.consumptions.length" class="empty-state"><i class="pi pi-shopping-bag"></i><h2>{{ t('front-desk.stay-details.no-consumptions') }}</h2></div>
    </section>
  </section>
  <section v-else class="empty-state panel-card"><i class="pi pi-exclamation-triangle"></i><h2>{{ t('front-desk.checkout.not-found') }}</h2></section>
</template>

<style scoped>
.checkout-payment-method {
  margin-top: 1rem;
}

.submit-field {
  justify-content: end;
}

.checkout-info-grid {
  grid-template-columns: 1fr;
}

.checkout-info-grid .form-field,
.checkout-info-grid .form-field.full {
  grid-column: auto;
}

.checkout-info-card input {
  text-overflow: ellipsis;
}

.payment-help,
.locked-consumption-message {
  font-size: 0.86rem;
  color: #64748b;
  line-height: 1.35;
}

.payment-help {
  margin: 0.75rem 0 0;
}

.prepaid-line strong {
  color: #15803d;
}

.consumptions-table td,
.consumptions-table th {
  font-weight: 400;
}
</style>
