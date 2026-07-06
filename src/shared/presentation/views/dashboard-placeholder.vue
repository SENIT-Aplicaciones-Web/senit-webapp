<script setup>
import { useI18n } from 'vue-i18n'
import useIamStore from '../../../iam/application/iam.store.js'

const { t } = useI18n()
const iamStore = useIamStore()
</script>

<template>
  <main class="dashboard">
    <h1>{{ t('dashboard.title') }}</h1>
    <p>{{ t('dashboard.content') }}</p>

    <section v-if="iamStore.currentUser" class="user-card">
      <p><strong>{{ t('dashboard.email') }}:</strong> {{ iamStore.currentUser.email }}</p>
      <p><strong>{{ t('dashboard.username') }}:</strong> {{ iamStore.currentUser.username }}</p>
      <p><strong>{{ t('dashboard.role') }}:</strong> {{ iamStore.currentUser.role }}</p>
    </section>
  </main>
</template>

<style scoped>
.dashboard {
  min-height: 100vh;
  padding: 3rem;
  background: #f8fafc;
}

.user-card {
  margin-top: 2rem;
  padding: 1.5rem;
  border-radius: 12px;
  background: white;
  max-width: 420px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
}
</style>
