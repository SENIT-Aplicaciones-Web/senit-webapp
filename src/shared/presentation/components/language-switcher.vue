<script setup>
import { watch } from 'vue'
import { useI18n } from 'vue-i18n'

defineProps({
  floating: {
    type: Boolean,
    default: false
  }
})

const { locale, availableLocales } = useI18n()

watch(locale, value => {
  localStorage.setItem('senit-webapp-locale', value)
}, { immediate: true })
</script>

<template>
  <pv-select-button
      v-model="locale"
      :options="availableLocales"
      class="language-switcher"
      :class="{ floating }"
  >
    <template #option="slotProps">
      <span>{{ slotProps.option.toUpperCase() }}</span>
    </template>
  </pv-select-button>
</template>

<style scoped>
.language-switcher {
  display: inline-flex;
}
.language-switcher.floating {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 20;
}
</style>
