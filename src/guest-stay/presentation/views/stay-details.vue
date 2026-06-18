<script setup>
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { toI18nKey } from '../../../shared/application/locale-key.js'
import useGuestStaysStore from '../../application/guest-stays.store.js'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const guestStaysStore = useGuestStaysStore()
const stay = computed(() => guestStaysStore.getStayById(route.params.id))
const showConsumptionForm = ref(false)
const canModifyConsumptions = computed(() => stay.value && stay.value.status !== 'finished' && stay.value.paymentStatus !== 'paid')
const feedback = ref({ type: '', message: '' })
const consumptionForm = reactive({ description: '', quantity: 1, unitPrice: 0 })

function isAdminRoute() { return route.path.startsWith('/admin') }
function routeName(frontDeskName, adminName) { return isAdminRoute() ? adminName : frontDeskName }
function goBack() {
  const from = route.query.from
  if (from === 'alerts') router.push({ name: routeName('front-desk-alerts', 'admin-alerts') })
  else if (from === 'rooms') router.push({ name: routeName('front-desk-rooms', 'admin-rooms') })
  else if (from === 'dashboard') router.push({ name: routeName('front-desk-dashboard', 'admin-dashboard') })
  else router.push({ name: routeName('front-desk-stays', 'admin-stays') })
}

function goToCheckout() {
  if (!stay.value) return
  router.push({ name: routeName('front-desk-stay-checkout', 'admin-stay-checkout'), params: { id: stay.value.id } })
}

async function addConsumption() {
  feedback.value = { type: '', message: '' }
  if (!canModifyConsumptions.value) {
    feedback.value = { type: 'error', message: t('front-desk.checkout.paid-consumption-locked') }
    return
  }
  const result = await guestStaysStore.addConsumption(stay.value.id, consumptionForm)
  feedback.value = { type: result.ok ? 'success' : 'error', message: result.message }
  if (result.ok) {
    consumptionForm.description = ''
    consumptionForm.quantity = 1
    consumptionForm.unitPrice = 0
    showConsumptionForm.value = false
  }
}

function resolveFeedbackMessage(message) {
  return /^[a-z0-9.-]+$/.test(message ?? '') ? t(message) : message
}
</script>

<template>
  <section class="page-shell" v-if="stay">
    <section class="toolbar-card checkout-back-toolbar">
      <button class="ghost-button" type="button" @click="goBack"><i class="pi pi-arrow-left"></i>{{ t('front-desk.stay-details.back') }}</button>
    </section>

    <section class="page-header">
      <div>
        <h1>{{ t('front-desk.stay-details.title') }}</h1>
        <p>{{ t('front-desk.common.room') }} {{ stay.room?.number }} · {{ stay.guest.fullName }}</p>
      </div>
      <span class="status-badge" :class="stay.status">{{ t('front-desk.stay-status.' + toI18nKey(stay.status)) }}</span>
    </section>

    <section class="grid-two">
      <article class="form-card">
        <div class="panel-header"><h2>{{ t('front-desk.stay-details.guest-information') }}</h2></div>
        <div class="form-grid">
          <div class="form-field"><label>{{ t('front-desk.stay-details.name') }}</label><input :value="stay.guest.fullName" disabled /></div>
          <div class="form-field"><label>{{ t('front-desk.stay-details.dni') }}</label><input :value="stay.guest.dni" disabled /></div>
          <div class="form-field"><label>{{ t('front-desk.stay-details.phone') }}</label><input :value="stay.guest.phone" disabled /></div>
          <div class="form-field"><label>{{ t('front-desk.stay-details.email') }}</label><input :value="stay.guest.email" disabled /></div>
          <div class="form-field"><label>{{ t('front-desk.common.entry') }}</label><input :value="stay.formattedCheckIn" disabled /></div>
          <div class="form-field"><label>{{ t('front-desk.stay-details.checkout-limit') }}</label><input :value="stay.formattedCheckOut" disabled /></div>
        </div>
      </article>

      <article class="form-card">
        <div class="panel-header"><h2>{{ t('front-desk.stay-details.payment-summary') }}</h2></div>
        <div class="result-list">
          <div class="result-item"><span><strong>{{ t('front-desk.stay-details.stay') }}</strong><small>{{ stay.hours }} {{ t('shared.states.hours') }}</small></span><strong>S/ {{ stay.initialAmount.toFixed(2) }}</strong></div>
          <div class="result-item"><span><strong>{{ t('front-desk.stay-details.consumptions') }}</strong><small>{{ t('front-desk.stay-details.registered-count', { count: stay.consumptions.length }) }}</small></span><strong>S/ {{ stay.consumptionsTotal.toFixed(2) }}</strong></div>
          <div class="result-item"><span><strong>{{ t('front-desk.stay-details.status') }}</strong><small>{{ t('front-desk.payment-status.' + toI18nKey(stay.paymentStatus)) }}</small></span><span class="status-badge" :class="stay.paymentStatus === 'paid' ? 'paid' : 'pending'">{{ t('front-desk.payment-status.' + toI18nKey(stay.paymentStatus)) }}</span></div>
          <div class="result-item"><span><strong>{{ t('front-desk.stay-details.total') }}</strong><small>{{ t('front-desk.stay-details.amount-description') }}</small></span><strong>S/ {{ stay.total.toFixed(2) }}</strong></div>
        </div>
        <button class="success-button" type="button" style="width:100%; margin-top:1rem;" :disabled="stay.status === 'finished'" @click="goToCheckout"><i class="pi pi-arrow-right"></i>{{ t('front-desk.stay-details.go-checkout') }}</button>
      </article>
    </section>

    <section class="panel-card">
      <div class="panel-header">
        <h2>{{ t('front-desk.stay-details.additional-consumptions') }}</h2>
        <button class="secondary-button" type="button" :disabled="!canModifyConsumptions" @click="showConsumptionForm = !showConsumptionForm"><i class="pi pi-plus"></i>{{ t('front-desk.stay-details.add') }}</button>
      </div>

      <p v-if="!canModifyConsumptions" class="help-message">{{ t('front-desk.checkout.paid-consumption-locked') }}</p>
      <form v-if="showConsumptionForm && canModifyConsumptions" class="form-grid" @submit.prevent="addConsumption" style="margin-bottom:1rem;">
        <div class="form-field"><label>{{ t('front-desk.stay-details.product-or-service') }}</label><input v-model="consumptionForm.description" type="text" :placeholder="t('front-desk.stay-details.consumption-placeholder')" /></div>
        <div class="form-field"><label>{{ t('front-desk.common.quantity') }}</label><input v-model.number="consumptionForm.quantity" min="1" type="number" /></div>
        <div class="form-field"><label>{{ t('front-desk.stay-details.unit-price') }}</label><input v-model.number="consumptionForm.unitPrice" min="0" step="0.1" type="number" /></div>
        <div class="form-field" style="justify-content:end;"><button class="success-button" type="submit"><i class="pi pi-check"></i>{{ t('front-desk.stay-details.save-consumption') }}</button></div>
      </form>
      <p v-if="feedback.message" class="feedback" :class="feedback.type">{{ resolveFeedbackMessage(feedback.message) }}</p>

      <div class="table-wrapper">
        <table class="data-table">
          <thead><tr><th>{{ t('front-desk.common.description') }}</th><th>{{ t('front-desk.common.quantity') }}</th><th>{{ t('front-desk.common.price') }}</th><th>{{ t('front-desk.common.subtotal') }}</th></tr></thead>
          <tbody>
            <tr v-for="consumption in stay.consumptions" :key="consumption.id">
              <td>{{ consumption.description }}</td>
              <td>{{ consumption.quantity }}</td>
              <td>S/ {{ Number(consumption.unitPrice).toFixed(2) }}</td>
              <td>S/ {{ (Number(consumption.quantity) * Number(consumption.unitPrice)).toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="!stay.consumptions.length" class="empty-state"><i class="pi pi-shopping-bag"></i><h2>{{ t('front-desk.stay-details.no-consumptions') }}</h2></div>
    </section>
  </section>

  <section v-else class="empty-state panel-card"><i class="pi pi-exclamation-triangle"></i><h2>{{ t('front-desk.stay-details.not-found') }}</h2><button class="secondary-button" @click="goBack">{{ t('shared.actions.back') }}</button></section>
</template>
