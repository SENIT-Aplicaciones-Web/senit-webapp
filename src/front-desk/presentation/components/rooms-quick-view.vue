<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { toI18nKey } from '../../../shared/application/locale-key.js'

const props = defineProps({
  rooms: { type: Array, default: () => [] }
})

defineEmits(['open-rooms'])

const { t } = useI18n()
const compactRooms = computed(() => props.rooms.slice(0, 12))
</script>

<template>
  <section class="panel-card quick-rooms-panel">
    <div class="panel-header">
      <h2>{{ t('front-desk.dashboard.rooms-quick-view') }}</h2>
      <button class="link-button" type="button" @click="$emit('open-rooms')">
        {{ t('front-desk.dashboard.open-rooms') }}
      </button>
    </div>
    <div class="quick-room-row">
      <button
        v-for="room in compactRooms"
        :key="room.id"
        class="quick-room-dot"
        :class="room.runtimeStatus"
        type="button"
        :title="`${t('front-desk.common.room')} ${room.number} - ${t('front-desk.rooms.status.' + toI18nKey(room.runtimeStatus))}`"
        @click="$emit('open-rooms')"
      >
        <span>{{ room.number }}</span>
        <i></i>
      </button>
    </div>
    <div class="quick-room-legend">
      <span><i class="occupied"></i>{{ t('front-desk.rooms.status.occupied') }}</span>
      <span><i class="available"></i>{{ t('front-desk.rooms.status.available') }}</span>
      <span><i class="cleaning"></i>{{ t('front-desk.rooms.status.cleaning') }}</span>
      <span><i class="maintenance"></i>{{ t('front-desk.rooms.status.maintenance') }}</span>
      <span><i class="endingSoon"></i>{{ t('front-desk.rooms.status.ending-soon') }}</span>
      <span><i class="overdue"></i>{{ t('front-desk.rooms.status.overdue') }}</span>
    </div>
  </section>
</template>
