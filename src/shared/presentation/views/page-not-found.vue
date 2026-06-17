<script setup>
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { t } = useI18n()

const unavailableRoute = router.currentRoute.value.fullPath
</script>

<template>
  <main class="not-found">
    <h1>{{ t('page-not-found.title') }}</h1>
    <p>{{ t('page-not-found.content', { route: unavailableRoute }) }}</p>
    <router-link to="/sign-in">
      {{ t('page-not-found.go-home') }}
    </router-link>
  </main>
</template>

<style scoped>
.not-found {
  min-height: 100vh;
  display: grid;
  place-content: center;
  text-align: center;
}
</style>