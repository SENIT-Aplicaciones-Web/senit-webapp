<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps({
  hotelName: { type: String, default: '' },
  username: { type: String, default: '' },
  fallbackRoleLabel: { type: String, default: '' }
})
</script>

<template>
  <header class="app-topbar compact-topbar app-topbar-clean">
    <div>
      <strong>{{ hotelName || t('brand.default-hotel') }}</strong>
      <small>{{ username || fallbackRoleLabel }}</small>
    </div>
  </header>
</template>
