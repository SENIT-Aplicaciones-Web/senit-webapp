<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import useIamStore from '../../application/iam.store.js'
import { SignUpCommand } from '../../domain/model/sign-up.command.js'
import LanguageSwitcher from '../../../shared/presentation/components/language-switcher.vue'

const { t } = useI18n()
const router = useRouter()
const iamStore = useIamStore()

onMounted(() => iamStore.clearMessages())

const email = ref('')
const username = ref('')
const password = ref('')
const showPassword = ref(false)
const submitted = ref(false)
const isSigningUp = ref(false)
const usernamePattern = /^[A-Za-z0-9_]+$/
const formErrors = computed(() => {
  const errors = []
  if (!email.value.trim() || !email.value.includes('@')) errors.push('auth.validation-email')
  if (!username.value.trim()) errors.push('auth.validation-username')
  else if (!usernamePattern.test(username.value.trim())) errors.push('auth.validation-username-format')
  if (!password.value || password.value.length < 6) errors.push('auth.validation-password')
  return errors
})

async function onSignUp() {
  if (isSigningUp.value) return
  submitted.value = true
  if (formErrors.value.length) return

  const command = new SignUpCommand({
    email: email.value,
    username: username.value,
    password: password.value
  })

  isSigningUp.value = true
  try {
    const success = await iamStore.signUp(command)

    if (success) {
      window.setTimeout(() => router.push({ name: 'admin-dashboard' }), 700)
    }
  } finally {
    isSigningUp.value = false
  }
}

function goToSignIn() {
  router.push({ name: 'sign-in' })
}
</script>

<template>
  <main class="auth-page">
    <language-switcher floating />

    <section class="brand-section">
      <div class="brand-content">
        <img class="brand-logo-full" src="/senit-logo-full.png" :alt="t('brand.name')" />
        <p class="brand-tagline">{{ t('brand.tagline') }}</p>
      </div>
    </section>

    <section class="divider"></section>

    <section class="form-section">
      <div class="auth-card">
        <h2>{{ t('auth.sign-up-title') }}</h2>
        <p class="subtitle">{{ t('auth.sign-up-subtitle') }}</p>
        <p class="admin-notice">{{ t('auth.admin-owner-notice') }}</p>

        <form @submit.prevent="onSignUp">
          <label for="email">{{ t('auth.email') }}</label>
          <span class="auth-input-icon"><i class="pi pi-envelope"></i><pv-input-text id="email" v-model="email" type="email" class="auth-input" /></span>

          <label for="username">{{ t('auth.username') }}</label>
          <span class="auth-input-icon"><i class="pi pi-user"></i><pv-input-text id="username" v-model="username" class="auth-input" /></span>

          <label for="password">{{ t('auth.create-password') }}</label>
          <span class="auth-input-icon"><i class="pi pi-lock"></i><pv-input-text id="password" v-model="password" :type="showPassword ? 'text' : 'password'" class="auth-input" /><button class="password-toggle" type="button" :aria-label="t('auth.toggle-password')" @click="showPassword = !showPassword"><i :class="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'"></i></button></span>

          <p v-if="submitted && formErrors.length" class="error-message">
            {{ t(formErrors[0]) }}
          </p>
          <p v-else-if="iamStore.errors.length" class="error-message">
            {{ t(iamStore.errors[0].message) }}
          </p>
          <p v-else-if="iamStore.successMessage" class="success-message">
            {{ t(iamStore.successMessage) }}
          </p>

          <div class="button-row">
            <pv-button :label="t('auth.register')" type="submit" class="auth-button" :disabled="isSigningUp" />
            <pv-button :label="t('auth.back')" type="button" class="auth-button secondary-auth-button" :disabled="isSigningUp" @click="goToSignIn" />
          </div>
        </form>
      </div>
    </section>

    <footer>{{ t('brand.copyright') }}</footer>
  </main>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1px 1.3fr;
  align-items: center;
  padding: 3rem 5rem 4rem;
  position: relative;
  background: #ffffff;
}

.brand-section {
  display: flex;
  justify-content: center;
}

.brand-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
  width: min(380px, 100%);
}

.brand-logo-full {
  width: min(320px, 100%);
  height: auto;
}

.brand-copy {
  display: grid;
  gap: 0.4rem;
}

.mark-block.big:first-child {
  border-radius: 18px 18px 0 18px;
}

.mark-block.big:last-child {
  border-radius: 0 0 18px 0;
}

.mark-block.small {
  background: #35b98f;
}

.logo-mark .small:nth-child(2) {
  border-radius: 0;
  transform: scale(0.75);
}

.logo-mark .small:nth-child(3) {
  background: #0d6efd;
}

.brand-tagline {
  margin: 1.4rem 0 0;
  font-size: 1.6rem;
  color: #9b9ba3;
}

.divider {
  width: 1px;
  height: 75vh;
  background: #e5e7eb;
}

.form-section {
  display: flex;
  justify-content: center;
}

.auth-card {
  width: 100%;
  max-width: 680px;
  min-height: 520px;
  background: #f4f4f5;
  border-radius: 16px;
  padding: 3rem 4rem;
}

.auth-card h2 {
  margin: 0;
  color: #1e3a8a;
  font-size: 2.2rem;
  font-weight: 800;
  text-align: center;
}

.subtitle {
  margin: 0.6rem 0 0.8rem;
  color: #9b9ba3;
  font-size: 1.1rem;
  text-align: center;
}

form {
  display: flex;
  flex-direction: column;
}

label {
  font-size: 1.45rem;
  margin: 0.9rem 0 0.5rem;
  color: #111111;
}

.auth-input {
  width: 100%;
  height: 56px;
  border-radius: 12px;
  font-size: 1.1rem;
}

.admin-notice {
  margin: 0 0 0.9rem;
  color: #64748b;
  font-size: 0.95rem;
  line-height: 1.35;
  text-align: center;
}

.auth-input-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.auth-input-icon > i {
  position: absolute;
  left: 1rem;
  color: #94a3b8;
  z-index: 1;
}

.auth-input-icon .auth-input {
  padding-left: 3rem;
  padding-right: 3rem;
}

.password-toggle {
  position: absolute;
  right: 0.8rem;
  border: 0;
  background: transparent;
  color: #64748b;
}

.button-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-top: 2.4rem;
}

.auth-button,
.auth-button.p-button {
  height: 74px;
  border-radius: 12px;
  font-size: 1.45rem;
  font-weight: 700;
  background: #2563eb;
  border: none;
  color: #ffffff;
}

.success-message {
  color: #16a34a;
  margin: 1rem 0 0;
}

.error-message {
  color: #dc2626;
  margin: 1rem 0 0;
}

.secondary-auth-button,
.secondary-auth-button.p-button {
  background: #eef4ff;
  border: 1px solid #bfdbfe;
  color: #1e3a8a;
}

.secondary-auth-button :deep(.p-button-label) {
  color: #1e3a8a;
}

footer {
  position: absolute;
  bottom: 1rem;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 1rem;
  color: #111111;
}

@media (max-width: 1000px) {
  .auth-page {
    grid-template-columns: 1fr;
    padding: 2rem;
    gap: 2rem;
  }

  .divider {
    display: none;
  }


  .auth-card {
    padding: 2rem;
  }
}
</style>
