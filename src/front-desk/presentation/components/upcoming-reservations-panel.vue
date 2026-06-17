<script setup>
import { useI18n } from 'vue-i18n'
import { toI18nKey } from '../../../shared/application/locale-key.js'

const { t } = useI18n()

defineProps({
  reservations: { type: Array, default: () => [] }
})

defineEmits(['view-all'])
</script>

<template>
  <article class="panel-card">
    <div class="panel-header">
      <h2>{{ t('front-desk.dashboard.upcoming-reservations') }}</h2>
      <button class="link-button" type="button" @click="$emit('view-all')">
        {{ t('shared.actions.view-all') }}
      </button>
    </div>
    <div class="table-wrapper no-horizontal-scroll">
      <table class="data-table compact-table">
        <thead>
          <tr>
            <th>{{ t('front-desk.common.guest') }}</th>
            <th>{{ t('front-desk.common.room') }}</th>
            <th>{{ t('front-desk.common.status') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="reservation in reservations" :key="reservation.id">
            <td>{{ reservation.guestName }}</td>
            <td><span class="room-badge">{{ reservation.room?.number }}</span></td>
            <td><span class="status-badge confirmed">{{ t('front-desk.reservation-status.' + toI18nKey(reservation.status)) }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-if="!reservations.length" class="help-message">
      {{ t('front-desk.dashboard.no-upcoming-reservations') }}
    </p>
  </article>
</template>
