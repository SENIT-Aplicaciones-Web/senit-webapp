<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import useIamStore from '../../application/iam.store.js'
import { SignInCommand } from '../../domain/model/sign-in.command.js'
import LanguageSwitcher from '../../../shared/presentation/components/language-switcher.vue'

const { t } = useI18n()
const router = useRouter()
const iamStore = useIamStore()

const email = ref('')
const password = ref('')

function onSignIn() {
  const command = new SignInCommand({
    email: email.value,
    password: password.value
  })

  const success = iamStore.signIn(command)

  if (success) {
    router.push({ name: 'app-dashboard' })
  }
}

function goToSignUp() {
  router.push({ name: 'iam-sign-up' })
}
</script>

<template>
  <main class="auth-page">
    <language-switcher />

    <section class="brand-section">
      <div class="brand-content">
        <div class="logo-mark">
          <div class="mark-block big"></div>
          <div class="mark-block small"></div>
          <div class="mark-block small"></div>
          <div class="mark-block big"></div>
        </div>

        <div>
          <h1>{{ t('brand.name') }}</h1>
          <p>{{ t('brand.tagline') }}</p>
        </div>
      </div>
    </section>

    <section class="divider"></section>

    <section class="form-section">
      <div class="auth-card">
        <h2>{{ t('auth.signInTitle') }}</h2>
        <p class="subtitle">{{ t('auth.signInSubtitle') }}</p>

        <form @submit.prevent="onSignIn">
          <label for="email">{{ t('auth.email') }}</label>
          <pv-input-text id="email" v-model="email" type="email" class="auth-input" />

          <label for="password">{{ t('auth.password') }}</label>
          <pv-input-text id="password" v-model="password" type="password" class="auth-input" />

          <button type="button" class="forgot-link">
            {{ t('auth.forgotPassword') }}
          </button>

          <p v-if="iamStore.errors.length" class="error-message">
            {{ t(iamStore.errors[0].message) }}
          </p>

          <div class="button-row">
            <pv-button :label="t('auth.signIn')" type="submit" class="auth-button" />
            <pv-button :label="t('auth.signUp')" type="button" class="auth-button" @click="goToSignUp" />
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
  align-items: center;
  gap: 1.5rem;
}

.logo-mark {
  width: 104px;
  height: 104px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.mark-block {
  background: #0d6efd;
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

.brand-content h1 {
  font-size: 5.3rem;
  line-height: 1;
  margin: 0;
  color: #062b6f;
  font-weight: 800;
}

.brand-content p {
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
  padding: 3.8rem 4rem;
}

.auth-card h2 {
  margin: 0;
  color: #1e3a8a;
  font-size: 2.2rem;
  font-weight: 800;
}

.subtitle {
  margin: 0.6rem 0 1.5rem;
  color: #9b9ba3;
  font-size: 1.1rem;
}

form {
  display: flex;
  flex-direction: column;
}

label {
  font-size: 1.45rem;
  margin: 1rem 0 0.6rem;
  color: #111111;
}

.auth-input {
  width: 100%;
  height: 56px;
  border-radius: 12px;
  font-size: 1.1rem;
}

.forgot-link {
  width: fit-content;
  border: none;
  background: transparent;
  color: #0d6efd;
  font-size: 1.05rem;
  margin: 0.7rem 0 1.8rem;
  padding: 0;
  cursor: pointer;
}

.button-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.auth-button {
  height: 74px;
  border-radius: 12px;
  font-size: 1.45rem;
  font-weight: 700;
  background: #2563eb;
  border: none;
}

.error-message {
  color: #dc2626;
  margin: 0 0 1rem;
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

  .brand-content h1 {
    font-size: 3.8rem;
  }

  .auth-card {
    padding: 2rem;
  }
}
</style>