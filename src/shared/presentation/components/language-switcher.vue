<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

defineProps({
  floating: {
    type: Boolean,
    default: false
  }
})

const SUPPORTED_LOCALES = ['es', 'en']
const { locale } = useI18n()

const selectedLocale = computed({
  get: () => SUPPORTED_LOCALES.includes(locale.value) ? locale.value : 'es',
  set: value => {
    if (!SUPPORTED_LOCALES.includes(value) || value === locale.value) return

    locale.value = value
    localStorage.setItem('senit-webapp-locale', value)
  }
})
</script>

<template>
  <pv-select-button
      v-model="selectedLocale"
      :options="SUPPORTED_LOCALES"
      :allow-empty="false"
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
