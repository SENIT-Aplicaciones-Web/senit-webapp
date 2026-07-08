<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import LanguageSwitcher from '../components/language-switcher.vue'

const router = useRouter()
const { t } = useI18n()

const unavailableRoute = computed(() => router.currentRoute.value.fullPath)
const logoUrl = `${import.meta.env.BASE_URL}senit-logo-full.png`

function goBack() {
  if (window.history.length > 1) {
    router.back()
    return
  }

  router.push({ name: 'sign-in' })
}
</script>

<template>
  <main class="not-found-page">
    <language-switcher floating />

    <section class="not-found-card" aria-labelledby="not-found-title">
      <img class="not-found-logo" :src="logoUrl" :alt="t('brand.name')" />

      <div class="not-found-status">
        <span>404</span>
      </div>

      <div class="not-found-copy">
        <p class="not-found-kicker">{{ t('page-not-found.kicker') }}</p>
        <h1 id="not-found-title">{{ t('page-not-found.title') }}</h1>
        <p class="not-found-description">
          {{ t('page-not-found.content', { route: unavailableRoute }) }}
        </p>
      </div>

      <div class="not-found-route">
        <i class="pi pi-link"></i>
        <span>{{ unavailableRoute }}</span>
      </div>

      <div class="not-found-actions">
        <router-link class="primary-action" to="/sign-in">
          <i class="pi pi-sign-in"></i>
          <span>{{ t('page-not-found.go-home') }}</span>
        </router-link>

        <button class="secondary-action" type="button" @click="goBack">
          <i class="pi pi-arrow-left"></i>
          <span>{{ t('page-not-found.go-back') }}</span>
        </button>
      </div>
    </section>
  </main>
</template>

<style scoped>
.not-found-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  position: relative;
  overflow: hidden;
  padding: 2rem;
  background:
      radial-gradient(circle at 15% 15%, rgba(53, 185, 143, 0.18), transparent 28rem),
      radial-gradient(circle at 85% 12%, rgba(37, 99, 235, 0.18), transparent 30rem),
      linear-gradient(135deg, #f8fbff 0%, #eef4ff 100%);
}

.not-found-page::before,
.not-found-page::after {
  content: '';
  position: absolute;
  width: 18rem;
  height: 18rem;
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.08);
  filter: blur(4px);
}

.not-found-page::before {
  left: -7rem;
  bottom: 10%;
}

.not-found-page::after {
  right: -6rem;
  top: 25%;
  background: rgba(53, 185, 143, 0.1);
}

.not-found-card {
  width: min(720px, 100%);
  display: grid;
  justify-items: center;
  gap: 1.25rem;
  position: relative;
  z-index: 1;
  padding: clamp(2rem, 5vw, 3.25rem);
  text-align: center;
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(219, 227, 239, 0.9);
  border-radius: 32px;
  box-shadow: 0 28px 70px rgba(15, 23, 42, 0.14);
  backdrop-filter: blur(18px);
}

.not-found-logo {
  width: min(230px, 72vw);
  height: auto;
}

.not-found-status {
  display: grid;
  place-items: center;
  width: 96px;
  height: 96px;
  color: #ffffff;
  background: linear-gradient(135deg, #2563eb, #35b98f);
  border-radius: 28px;
  box-shadow: 0 18px 34px rgba(37, 99, 235, 0.25);
  transform: rotate(-4deg);
}

.not-found-status span {
  display: block;
  font-size: 2.1rem;
  font-weight: 900;
  letter-spacing: -0.08em;
  transform: rotate(4deg);
}

.not-found-copy {
  display: grid;
  gap: 0.65rem;
}

.not-found-kicker {
  margin: 0;
  color: #2563eb;
  font-size: 0.78rem;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.not-found-copy h1 {
  margin: 0;
  color: #1e3a8a;
  font-size: clamp(2.05rem, 5vw, 3.4rem);
  font-weight: 900;
  line-height: 1.05;
}

.not-found-description {
  max-width: 560px;
  margin: 0 auto;
  color: #64748b;
  font-size: 1rem;
  line-height: 1.65;
}

.not-found-route {
  max-width: min(560px, 100%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  padding: 0.75rem 1rem;
  color: #334155;
  background: #f8fbff;
  border: 1px solid #dbe3ef;
  border-radius: 999px;
  font-size: 0.92rem;
  font-weight: 700;
}

.not-found-route span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.not-found-actions {
  display: flex;
  justify-content: center;
  gap: 0.85rem;
  flex-wrap: wrap;
  margin-top: 0.25rem;
}

.primary-action,
.secondary-action {
  min-height: 46px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  padding: 0.75rem 1.15rem;
  border-radius: 14px;
  font-weight: 900;
  transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
}

.primary-action {
  color: #ffffff;
  background: linear-gradient(90deg, #2563eb, #3b82f6);
  box-shadow: 0 14px 28px rgba(37, 99, 235, 0.24);
}

.secondary-action {
  color: #1e3a8a;
  background: #ffffff;
  border: 1px solid #c7d2fe;
}

.primary-action:hover,
.secondary-action:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 28px rgba(15, 23, 42, 0.12);
}

.secondary-action:hover {
  background: #eef4ff;
}

@media (max-width: 640px) {
  .not-found-page {
    padding: 1rem;
  }

  .not-found-card {
    border-radius: 24px;
  }

  .not-found-actions {
    width: 100%;
  }

  .primary-action,
  .secondary-action {
    width: 100%;
  }
}
</style>
