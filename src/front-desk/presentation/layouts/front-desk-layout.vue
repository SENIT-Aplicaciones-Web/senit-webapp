<script setup>
import { computed, ref } from 'vue'
import useIamStore from '../../../iam/application/iam.store.js'
import useFrontDeskStore from '../../application/front-desk.store.js'
import { useI18n } from 'vue-i18n'
import FrontDeskSidebar from '../components/front-desk-sidebar.vue'

const iamStore = useIamStore()
const frontDeskStore = useFrontDeskStore()
const { t } = useI18n()
const activeAlertCount = computed(() => frontDeskStore.endingSoonStays.length + frontDeskStore.overdueStays.length)
const mobileSidebarOpen = ref(false)

function toggleMobileSidebar() { mobileSidebarOpen.value = !mobileSidebarOpen.value }
function closeMobileSidebar() { mobileSidebarOpen.value = false }
function closeSidebarAfterNavigation(event) {
  if (event.target.closest('a')) closeMobileSidebar()
}
</script>

<template>
  <main class="app-shell" :class="{ 'sidebar-open': mobileSidebarOpen }">
    <button class="mobile-sidebar-button" type="button" :aria-label="mobileSidebarOpen ? t('shared.navigation.close-menu') : t('shared.navigation.open-menu')" :aria-expanded="mobileSidebarOpen" @click.stop="toggleMobileSidebar">
      <i :class="mobileSidebarOpen ? 'pi pi-times' : 'pi pi-bars'"></i>
    </button>
    <div v-if="mobileSidebarOpen" class="mobile-sidebar-backdrop" @click="closeMobileSidebar"></div>
    <front-desk-sidebar
      :is-admin="iamStore.isAdmin"
      :notification-count="activeAlertCount"
      class="mobile-sidebar-drawer"
      @click="closeSidebarAfterNavigation"
    />
    <section class="app-content role-content">
      <router-view />
    </section>
  </main>
</template>
