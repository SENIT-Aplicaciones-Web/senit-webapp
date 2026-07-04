<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import useIamStore from '../../application/iam.store.js'
import { SignInCommand } from '../../domain/model/sign-in.command.js'
import LanguageSwitcher from '../../../shared/presentation/components/language-switcher.vue'

const { t } = useI18n()
const router = useRouter()
const iamStore = useIamStore()

onMounted(() => iamStore.clearMessages())

const email = ref('')
const password = ref('')
const showPassword = ref(false)

async function onSignIn() {
  const command = new SignInCommand({
    email: email.value,
    password: password.value
  })

  const success = await iamStore.signIn(command)

  if (success) {
    router.push(iamStore.currentUser?.role === 'ADMIN'
        ? { name: 'admin-dashboard' }
        : { name: 'front-desk-dashboard' })
  }
}

function goToSignUp() {
  router.push({ name: 'sign-up' })
}
</script>

<template>
  <main class="auth-page">
    <language-switcher floating />

    <section class="brand-section">
      <div class="brand-content">
        <img class="brand-logo-full" src="/senit-logo-full.png" :alt="t('brand.name')" />
        <p class="brand-tagline">{{ t('brand.tagline') }}</p><br>
        
        <h2>{{t('credentials.demo')}}</h2>
        <h2>admin@admin.com / 123456</h2>
        <h2>recepcion@recepcion.com / 12345</h2>
      </div>
    </section>

    <section class="divider"></section>

    <section class="form-section">
      <div class="auth-card">
        <h2>{{ t('auth.sign-in-title') }}</h2>
        <p class="subtitle">{{ t('auth.sign-in-subtitle') }}</p>

        <form @submit.prevent="onSignIn">
          <label for="email">{{ t('auth.email') }}</label>
          <span class="auth-input-icon">
            <i class="pi pi-envelope"></i>
            <pv-input-text id="email" v-model="email" type="email" class="auth-input" />
          </span>

          <label for="password">{{ t('auth.password') }}</label>
          <span class="auth-input-icon">
            <i class="pi pi-lock"></i>
            <pv-input-text id="password" v-model="password" :type="showPassword ? 'text' : 'password'" class="auth-input" />
            <button class="password-toggle" type="button" :aria-label="t('auth.toggle-password')" @click="showPassword = !showPassword"><i :class="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'"></i></button>
          </span>


          <p v-if="iamStore.errors.length" class="error-message">
            {{ t(iamStore.errors[0].message) }}
          </p>

          <div class="button-row">
            <pv-button :label="t('auth.sign-in')" type="submit" class="auth-button" />
            <pv-button :label="t('auth.sign-up')" type="button" class="auth-button" @click="goToSignUp" />
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
  padding-left: 3rem !important;
  padding-right: 3rem !important;
}

.password-toggle {
  position: absolute;
  right: 0.8rem;
  border: 0;
  background: transparent;
  color: #64748b;
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
  margin-top: 2rem;
}

.auth-button,
.auth-button.p-button {
  height: 74px;
  border-radius: 12px;
  font-size: 1.45rem;
  font-weight: 700;
  background: #2563eb !important;
  border: none !important;
  color: #ffffff !important;
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


  .auth-card {
    padding: 2rem;
  }
}
</style>
