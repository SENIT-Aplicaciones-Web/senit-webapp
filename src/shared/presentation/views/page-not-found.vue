<script setup>
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { t } = useI18n()

const unavailableRoute = router.currentRoute.value.fullPath
</script>

<template>
  <main class="not-found">
    <h1>{{ t('pageNotFound.title') }}</h1>
    <p>{{ t('pageNotFound.content', { route: unavailableRoute }) }}</p>
    <router-link to="/iam/sign-in">
      {{ t('pageNotFound.goHome') }}
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