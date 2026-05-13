<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import useIamStore from '../../../iam/application/iam.store.js'

const { t, locale, availableLocales } = useI18n()
const iamStore = useIamStore()

const viewMode = ref('compact')
const notificationsEnabled = ref(true)

function signOut() {
  iamStore.signOut()
  window.location.href = '/iam/sign-in'
}
</script>

<template>
  <section class="settings-page">
    <header class="topbar">
      <div class="search-box">
        <input
            type="text"
            :placeholder="t('frontDesk.settings.searchPlaceholder')"
        />
        <i class="pi pi-search"></i>
      </div>
    </header>

    <section class="title-section">
      <h1>{{ t('frontDesk.settings.title') }}</h1>
      <p>{{ t('frontDesk.settings.subtitle') }}</p>
    </section>

    <section class="settings-grid">
      <div class="left-column">
        <article class="panel profile-panel">
          <div class="panel-header">
            <h2>{{ t('frontDesk.settings.userProfile') }}</h2>

            <button class="outline-button">
              {{ t('frontDesk.settings.editProfile') }}
            </button>
          </div>

          <div class="profile-content">
            <div class="avatar-box">
              <i class="pi pi-user"></i>
            </div>

            <div class="profile-form">
              <div class="field">
                <label>{{ t('frontDesk.settings.fullName') }}</label>
                <input type="text" value="Recepcionista Senit" readonly />
              </div>

              <div class="field">
                <label>{{ t('frontDesk.settings.email') }}</label>
                <input type="text" value="recepcion@senit.com" readonly />
              </div>

              <div class="field full">
                <label>{{ t('frontDesk.settings.role') }}</label>
                <input type="text" value="Front Desk Staff" readonly />
              </div>
            </div>
          </div>
        </article>

        <article class="panel workspace-panel">
          <h2>{{ t('frontDesk.settings.workspaceCustomization') }}</h2>

          <div class="setting-row">
            <div>
              <strong>{{ t('frontDesk.settings.viewMode') }}</strong>
              <span>{{ t('frontDesk.settings.viewModeDescription') }}</span>
            </div>

            <div class="segmented-control">
              <button
                  :class="{ active: viewMode === 'compact' }"
                  @click="viewMode = 'compact'"
              >
                {{ t('frontDesk.settings.compact') }}
              </button>

              <button
                  :class="{ active: viewMode === 'spaced' }"
                  @click="viewMode = 'spaced'"
              >
                {{ t('frontDesk.settings.spaced') }}
              </button>
            </div>
          </div>

          <div class="setting-row">
            <div>
              <strong>{{ t('frontDesk.settings.systemNotifications') }}</strong>
              <span>{{ t('frontDesk.settings.notificationsDescription') }}</span>
            </div>

            <button
                class="switch"
                :class="{ enabled: notificationsEnabled }"
                @click="notificationsEnabled = !notificationsEnabled"
            >
              <span></span>
            </button>
          </div>
        </article>
      </div>

      <div class="right-column">
        <article class="panel small-panel">
          <h2>{{ t('frontDesk.settings.language') }}</h2>
          <p>{{ t('frontDesk.settings.selectLanguage') }}</p>

          <select v-model="locale">
            <option
                v-for="availableLocale in availableLocales"
                :key="availableLocale"
                :value="availableLocale"
            >
              {{ availableLocale.toUpperCase() }}
            </option>
          </select>
        </article>

        <article class="panel small-panel">
          <h2>{{ t('frontDesk.settings.security') }}</h2>

          <button class="disabled-button" disabled>
            <i class="pi pi-lock"></i>
            {{ t('frontDesk.settings.changePassword') }}
          </button>

          <button class="danger-button" @click="signOut">
            <i class="pi pi-sign-out"></i>
            {{ t('frontDesk.settings.signOut') }}
          </button>
        </article>
      </div>
    </section>

    <section class="system-info">
      <div>
        <span>{{ t('frontDesk.settings.lastAccess') }}</span>
        <strong>{{ t('frontDesk.settings.lastAccessValue') }}</strong>
      </div>

      <div>
        <span>{{ t('frontDesk.settings.systemVersion') }}</span>
        <strong>v2.4.0 - build</strong>
      </div>

      <div>
        <span>{{ t('frontDesk.settings.connectionStatus') }}</span>
        <strong>{{ t('frontDesk.settings.encrypted') }}</strong>
      </div>
    </section>
  </section>
</template>

<style scoped>
.settings-page {
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
  margin-bottom: 1.4rem;
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

.settings-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1rem;
}

.left-column,
.right-column {
  display: grid;
  gap: 1rem;
}

.panel {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 1.2rem;
  box-shadow: 0 12px 26px rgba(15, 23, 42, 0.06);
}

.panel h2 {
  margin: 0;
  color: #0f172a;
  font-size: 1.1rem;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.outline-button {
  height: 36px;
  min-width: 120px;
  border-radius: 10px;
  border: 1px solid #475569;
  background: #ffffff;
  color: #0f172a;
  font-weight: 700;
  cursor: pointer;
}

.profile-content {
  display: grid;
  grid-template-columns: 96px 1fr;
  gap: 1.5rem;
  align-items: center;
}

.avatar-box {
  width: 86px;
  height: 86px;
  border: 1px solid #cbd5e1;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: #f8fafc;
}

.avatar-box i {
  font-size: 2.8rem;
  color: #64748b;
}

.profile-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.field.full {
  grid-column: 1 / -1;
}

.field label {
  color: #64748b;
  font-size: 0.82rem;
  font-weight: 700;
}

.field input,
.small-panel select {
  height: 40px;
  border: 1px solid #dbe3ef;
  border-radius: 11px;
  background: #f8fafc;
  color: #334155;
  padding: 0 0.8rem;
}

.workspace-panel {
  display: grid;
  gap: 1.3rem;
}

.setting-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.setting-row div:first-child {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.setting-row strong {
  color: #0f172a;
}

.setting-row span {
  color: #64748b;
  font-size: 0.85rem;
}

.segmented-control {
  display: flex;
  border: 1px solid #475569;
  border-radius: 999px;
  overflow: hidden;
}

.segmented-control button {
  min-width: 100px;
  height: 34px;
  border: none;
  background: #ffffff;
  color: #0f172a;
  cursor: pointer;
}

.segmented-control button.active {
  background: #111827;
  color: #ffffff;
}

.switch {
  width: 52px;
  height: 28px;
  border: none;
  border-radius: 999px;
  background: #cbd5e1;
  padding: 3px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.switch span {
  width: 22px;
  height: 22px;
  background: #ffffff;
  border-radius: 50%;
  transition: 0.2s ease;
}

.switch.enabled {
  background: #111827;
}

.switch.enabled span {
  transform: translateX(24px);
}

.small-panel {
  display: grid;
  gap: 0.8rem;
}

.small-panel p {
  margin: 0;
  color: #64748b;
  font-size: 0.9rem;
}

.disabled-button,
.danger-button {
  height: 46px;
  border: none;
  border-radius: 13px;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  text-transform: uppercase;
}

.disabled-button {
  background: #cbd5e1;
  color: #ffffff;
  cursor: not-allowed;
}

.danger-button {
  background: #fee2e2;
  color: #ef4444;
}

.system-info {
  margin-top: 1.8rem;
  background: #ffffff;
  border: 1px dashed #94a3b8;
  border-radius: 18px;
  padding: 1.2rem;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  text-align: center;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.04);
}

.system-info div {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.system-info div:not(:last-child) {
  border-right: 1px solid #94a3b8;
}

.system-info span {
  color: #64748b;
  font-size: 0.78rem;
  text-transform: uppercase;
}

.system-info strong {
  color: #0f172a;
}

@media (max-width: 1000px) {
  .settings-grid {
    grid-template-columns: 1fr;
  }

  .system-info {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .system-info div:not(:last-child) {
    border-right: none;
    border-bottom: 1px solid #94a3b8;
    padding-bottom: 1rem;
  }
}

@media (max-width: 720px) {
  .settings-page {
    padding: 1rem;
  }

  .profile-content,
  .profile-form {
    grid-template-columns: 1fr;
  }

  .setting-row {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>