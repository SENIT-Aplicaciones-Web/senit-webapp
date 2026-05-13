<script setup>
import { useI18n } from 'vue-i18n'

const { locale, availableLocales } = useI18n()
</script>

<template>
  <pv-select-button
      v-model="locale"
      :options="availableLocales"
      class="language-switcher"
  >
    <template #option="slotProps">
      <span>{{ slotProps.option.toUpperCase() }}</span>
    </template>
  </pv-select-button>
</template>

<style scoped>
.language-switcher {
  position: fixed;
  top: 1rem;
  right: 1rem;
}
</style>