<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import useIamStore from '../../application/iam.store.js'
import LanguageSwitcher from '../../../shared/presentation/components/language-switcher.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const iamStore = useIamStore()
const session = ref(null)
const isLoading = ref(true)

const sessionId = computed(() => String(route.query.session_id ?? ''))
const isCompleted = computed(() => session.value?.status === 'completed')

onMounted(loadSession)

async function loadSession() {
  isLoading.value = true
  try {
    if (!sessionId.value) return
    session.value = await iamStore.getStripeSubscriptionCheckoutSession(sessionId.value)
  } finally {
    isLoading.value = false
  }
}

function goToSignIn() {
  router.push({ name: 'sign-in' })
}
</script>

<template>
  <main class="success-page">
    <language-switcher floating />
    <section class="success-card">
      <div class="success-icon" :class="{ pending: !isCompleted }">
        <i :class="isCompleted ? 'pi pi-check' : 'pi pi-clock'"></i>
      </div>
      <p class="success-kicker">{{ t('checkout.success.badge') }}</p>
      <h1>{{ isCompleted ? t('checkout.success.title') : t('checkout.success.pending-title') }}</h1>
      <p v-if="isLoading">{{ t('checkout.success.loading') }}</p>
      <p v-else>{{ isCompleted ? t('checkout.success.message') : t('checkout.success.pending-message') }}</p>
      <div v-if="session" class="success-details">
        <span>{{ t('checkout.stripe.plan') }}: <strong>{{ session.plan }}</strong></span>
        <span>{{ t('subscription.amount') }}: <strong>S/ {{ Number(session.amount).toFixed(2) }}</strong></span>
        <span>{{ t('subscription.payment-status') }}: <strong>{{ isCompleted ? t('subscription.completed') : t('checkout.success.pending-status') }}</strong></span>
      </div>
      <p v-if="iamStore.errors.length" class="error-message">{{ t(iamStore.errors[0].message) }}</p>
      <button class="primary-action" type="button" @click="goToSignIn">
        {{ t('checkout.success.go-login') }}
      </button>
    </section>
  </main>
</template>

<style scoped>
.success-page {
  min-height: 100vh;
  background: #f8fafc;
  display: grid;
  place-items: center;
  padding: 2rem;
}

.success-card {
  width: min(620px, 100%);
  background: #ffffff;
  border-radius: 28px;
  padding: 3rem;
  text-align: center;
  box-shadow: 0 24px 70px rgba(15, 23, 42, 0.12);
}

.success-icon {
  width: 76px;
  height: 76px;
  margin: 0 auto 1rem;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: #ffffff;
  background: #16a34a;
  font-size: 2rem;
}

.success-icon.pending {
  background: #f59e0b;
}

.success-kicker {
  color: #2563eb;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.success-card h1 {
  color: #0f172a;
  margin: 0.4rem 0;
}

.success-card p {
  color: #64748b;
  line-height: 1.5;
}

.success-details {
  margin: 1.4rem 0;
  border: 1px solid #dbe3ef;
  border-radius: 18px;
  padding: 1rem;
  display: grid;
  gap: 0.5rem;
  text-align: left;
  color: #475569;
}

.primary-action {
  border: 0;
  border-radius: 999px;
  padding: 0.95rem 1.5rem;
  background: #1d4ed8;
  color: #ffffff;
  font-weight: 800;
}

.error-message {
  color: #dc2626;
}
</style>
