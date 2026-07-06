<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import useIamStore from '../../../iam/application/iam.store.js'
import useFrontDeskStore from '../../application/front-desk.store.js'
import LanguageSwitcher from '../../../shared/presentation/components/language-switcher.vue'
import { formatDateTime } from '../../../shared/domain/services/date-format.service.js'

const router = useRouter()
const { t } = useI18n()
const iamStore = useIamStore()
const frontDeskStore = useFrontDeskStore()
const passwordForm = reactive({ newPassword: '', confirmPassword: '' })
const passwordFeedback = ref({ type: '', message: '' })
const isChangingPassword = ref(false)

const lastAccess = computed(() => {
  const stored = localStorage.getItem('senit-webapp-last-access')
  return stored ? formatDateTime(stored) : formatDateTime(new Date())
})

const roleLabel = computed(() => iamStore.currentUser?.role === 'ADMIN'
  ? t('front-desk.navigation.role-admin')
  : t('front-desk.navigation.role-reception'))

async function changePassword() {
  if (isChangingPassword.value) return
  passwordFeedback.value = { type: '', message: '' }
  if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
    passwordFeedback.value = { type: 'error', message: t('front-desk.settings.password-too-short') }
    return
  }
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    passwordFeedback.value = { type: 'error', message: t('front-desk.settings.passwords-do-not-match') }
    return
  }
  isChangingPassword.value = true
  try {
    const success = await iamStore.changePassword(passwordForm.newPassword)
    passwordFeedback.value = {
      type: success ? 'success' : 'error',
      message: success ? t('front-desk.settings.password-updated') : t('front-desk.settings.password-update-error')
    }
    if (success) Object.assign(passwordForm, { newPassword: '', confirmPassword: '' })
  } finally {
    isChangingPassword.value = false
  }
}

function signOut() {
  iamStore.signOut()
  router.push({ name: 'sign-in' })
}
</script>

<template>
  <section class="page-shell settings-page">
    <section class="page-header">
      <div><h1>{{ t('front-desk.settings.title') }}</h1><p>{{ t('front-desk.settings.subtitle') }}</p></div>
    </section>

    <section class="grid-two settings-grid">
      <article class="form-card">
        <div class="panel-header"><h2>{{ t('front-desk.settings.user-profile') }}</h2></div>
        <div class="form-grid">
          <div class="form-field"><label>{{ t('front-desk.settings.username') }}</label><span class="settings-input-icon"><i class="pi pi-user"></i><input :value="iamStore.currentUser?.username" disabled /></span></div>
          <div class="form-field"><label>{{ t('front-desk.settings.email') }}</label><span class="settings-input-icon"><i class="pi pi-envelope"></i><input :value="iamStore.currentUser?.email" disabled /></span></div>
          <div class="form-field"><label>{{ t('front-desk.settings.role') }}</label><span class="settings-input-icon"><i class="pi pi-id-card"></i><input :value="roleLabel" disabled /></span></div>
          <div class="form-field"><label>{{ t('front-desk.settings.hotel') }}</label><span class="settings-input-icon"><i class="pi pi-building"></i><input :value="frontDeskStore.activeHotel?.name" disabled /></span></div>
        </div>
        <p v-if="iamStore.currentUser?.role !== 'ADMIN'" class="help-message">{{ t('front-desk.settings.profile-managed') }}</p>
      </article>

      <article class="form-card language-card">
        <div class="panel-header"><h2>{{ t('front-desk.settings.language-title') }}</h2></div>
        <p class="help-message">{{ t('front-desk.settings.language-description') }}</p>
        <language-switcher />
      </article>
    </section>

    <section class="grid-two settings-grid">
      <article class="form-card">
        <div class="panel-header"><h2>{{ t('front-desk.settings.security') }}</h2></div>
        <p class="help-message">{{ t('front-desk.settings.account-managed') }}</p>
        <form class="form-grid password-grid" :aria-busy="isChangingPassword" @submit.prevent="changePassword">
          <div class="form-field"><label>{{ t('front-desk.settings.new-password') }}</label><input v-model="passwordForm.newPassword" type="password" /></div>
          <div class="form-field"><label>{{ t('front-desk.settings.confirm-password') }}</label><input v-model="passwordForm.confirmPassword" type="password" /></div>
          <div class="form-field full"><button class="secondary-button" type="submit" :disabled="isChangingPassword"><i class="pi pi-lock"></i>{{ t('front-desk.settings.change-password') }}</button></div>
        </form>
        <p v-if="passwordFeedback.message" class="feedback" :class="passwordFeedback.type">{{ passwordFeedback.message }}</p>
      </article>

      <article class="form-card">
        <div class="panel-header"><h2>{{ t('front-desk.settings.system-data') }}</h2></div>
        <div class="result-list">
          <div class="result-item"><span><strong>{{ t('front-desk.settings.last-access') }}</strong><small>{{ lastAccess }}</small></span><i class="pi pi-clock"></i></div>
          <div class="result-item"><span><strong>{{ t('front-desk.settings.system-version') }}</strong><small>{{ t('front-desk.settings.version-value') }}</small></span><i class="pi pi-info-circle"></i></div>
        </div>
        <button class="danger-button signout-button" type="button" @click="signOut"><i class="pi pi-sign-out"></i>{{ t('front-desk.settings.sign-out') }}</button>
      </article>
    </section>
  </section>
</template>

<style scoped>
.settings-page { display: grid; gap: 1rem; }
.password-grid { margin-top: 1rem; }
.signout-button { margin-top: 1rem; }
.settings-input-icon { position: relative; display: flex; align-items: center; }
.settings-input-icon i { position: absolute; left: 0.9rem; color: #94a3b8; }
.settings-input-icon input { padding-left: 2.8rem; }
</style>
