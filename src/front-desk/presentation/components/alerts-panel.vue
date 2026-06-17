<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps({ alerts: { type: Array, default: () => [] } })
defineEmits(['view-all'])

function alertClass(type) {
  if (type === 'danger') return 'overdue'
  if (type === 'warning') return 'endingSoon'
  return 'active'
}

function alertTitle(alert) {
  return alert.titleKey ? t(alert.titleKey, alert.titleParams ?? {}) : alert.title
}

function alertMessage(alert) {
  return alert.messageKey ? t(alert.messageKey, alert.messageParams ?? {}) : alert.message
}
</script>

<template>
  <article class="panel-card alerts-panel-card">
    <div class="panel-header">
      <div>
        <h2>{{ t('front-desk.dashboard.operational-alerts') }}</h2>
        <p class="panel-hint">{{ t('front-desk.dashboard.alert-hint') }}</p>
      </div>
      <button class="link-button" type="button" @click="$emit('view-all')">
        {{ t('shared.actions.view-all') }}
      </button>
    </div>

    <div class="result-list alert-list">
      <button v-for="alert in alerts" :key="alert.id" class="result-item alert-item" type="button" @click="$emit('view-all')">
        <span><strong>{{ alertTitle(alert) }}</strong><small>{{ alertMessage(alert) }}</small></span>
        <span class="status-badge" :class="alertClass(alert.type)">{{ alert.type === 'danger' ? t('front-desk.dashboard.urgent') : t('front-desk.dashboard.warning') }}</span>
      </button>
    </div>
    <p v-if="!alerts.length" class="help-message">{{ t('front-desk.dashboard.no-alerts') }}</p>
  </article>
</template>

<style scoped>
.panel-hint {
  margin: 0.15rem 0 0;
  color: #64748b;
  font-size: 0.86rem;
}

</style>
