<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import useIamStore from '../../../iam/application/iam.store.js'
import useFrontDeskStore from '../../application/front-desk.store.js'

const props = defineProps({
  mode: { type: String, default: 'front-desk' },
  isAdmin: { type: Boolean, default: false },
  notificationCount: { type: Number, default: 0 }
})

const { t } = useI18n()
const router = useRouter()
const iamStore = useIamStore()
const frontDeskStore = useFrontDeskStore()

const isAdminShell = computed(() => props.mode === 'admin')
const brandRoute = computed(() => isAdminShell.value ? '/admin/dashboard' : '/front-desk/dashboard')
const brandLabel = computed(() => t('brand.name'))
const currentUser = computed(() => iamStore.currentUser ?? {})
const initials = computed(() => {
  const source = currentUser.value.fullName || currentUser.value.username || currentUser.value.email || 'SN'
  const first = source.trim()[0]?.toUpperCase() ?? 'S'
  const second = source.trim().includes(' ') ? source.trim().substring(source.trim().lastIndexOf(' ') + 1)[0]?.toUpperCase() : source.trim()[1]?.toUpperCase()
  return `${first}${second || 'N'}`
})

function signOut() {
  iamStore.signOut()
  router.push({ name: 'sign-in' })
}
</script>

<template>
  <aside class="app-sidebar" :class="{ 'admin-sidebar': isAdminShell }">
    <router-link class="brand" :to="brandRoute" aria-label="Senit">
      <img class="senit-brand-image" src="/senit-logo-full.png" :alt="brandLabel" />
    </router-link>

    <section class="sidebar-context-card">
      <p class="sidebar-hotel-name">{{ frontDeskStore.activeHotel?.name || t('brand.default-hotel') }}</p>
      <div class="sidebar-user-row">
        <span class="user-avatar">{{ initials }}</span>
        <span class="sidebar-user-text">
          <strong>{{ currentUser.fullName || currentUser.username || t('front-desk.navigation.user') }}</strong>
          <small>{{ currentUser.email }}</small>
        </span>
      </div>
    </section>

    <template v-if="isAdminShell">
      <p class="sidebar-label">{{ t('front-desk.navigation.admin') }}</p>
      <nav class="sidebar-nav">
        <router-link to="/admin/dashboard"><i class="pi pi-th-large"></i><span>{{ t('front-desk.navigation.main-panel') }}</span></router-link>
        <router-link to="/admin/hotel"><i class="pi pi-building"></i><span>{{ t('front-desk.navigation.hotel') }}</span></router-link>
        <router-link to="/admin/rooms"><i class="pi pi-home"></i><span>{{ t('front-desk.navigation.rooms') }}</span></router-link>
        <router-link to="/admin/reservations"><i class="pi pi-calendar"></i><span>{{ t('front-desk.navigation.reservations') }}</span></router-link>
        <router-link to="/admin/stays"><i class="pi pi-users"></i><span>{{ t('front-desk.navigation.stays') }}</span></router-link>
        <router-link to="/admin/alerts" class="nav-link-with-badge">
          <i class="pi pi-bell"></i>
          <span>{{ t('front-desk.navigation.alerts') }}</span>
          <span v-if="notificationCount > 0" class="sidebar-alert-badge">{{ notificationCount }}</span>
        </router-link>
        <router-link to="/admin/subscription"><i class="pi pi-credit-card"></i><span>{{ t('front-desk.navigation.subscription') }}</span></router-link>
        <router-link to="/admin/staff"><i class="pi pi-id-card"></i><span>{{ t('front-desk.navigation.staff-roles') }}</span></router-link>
        <router-link to="/admin/settings"><i class="pi pi-cog"></i><span>{{ t('front-desk.navigation.settings') }}</span></router-link>
      </nav>
    </template>

    <template v-else>
      <p class="sidebar-label">{{ t('front-desk.navigation.reception') }}</p>
      <nav class="sidebar-nav">
        <router-link to="/front-desk/dashboard"><i class="pi pi-th-large"></i><span>{{ t('front-desk.navigation.control-panel') }}</span></router-link>
        <router-link to="/front-desk/rooms"><i class="pi pi-building-columns"></i><span>{{ t('front-desk.navigation.rooms') }}</span></router-link>
        <router-link to="/front-desk/stays"><i class="pi pi-users"></i><span>{{ t('front-desk.navigation.stays') }}</span></router-link>
        <router-link to="/front-desk/check-in"><i class="pi pi-sign-in"></i><span>{{ t('front-desk.navigation.check-in') }}</span></router-link>
        <router-link to="/front-desk/reservations"><i class="pi pi-calendar"></i><span>{{ t('front-desk.navigation.reservations') }}</span></router-link>
        <router-link to="/front-desk/alerts" class="nav-link-with-badge">
          <i class="pi pi-bell"></i>
          <span>{{ t('front-desk.navigation.alerts') }}</span>
          <span v-if="notificationCount > 0" class="sidebar-alert-badge">{{ notificationCount }}</span>
        </router-link>
        <router-link to="/front-desk/settings"><i class="pi pi-cog"></i><span>{{ t('front-desk.navigation.settings') }}</span></router-link>
      </nav>
    </template>

    <button class="sidebar-logout" type="button" @click="signOut">
      <i class="pi pi-sign-out"></i>
      <span>{{ t('front-desk.settings.sign-out') }}</span>
    </button>
  </aside>
</template>

<style scoped>
.senit-brand-image {
  display: block;
  width: min(182px, 100%);
  height: auto;
}

.sidebar-context-card {
  padding: 0.9rem;
  border: 1px solid #dbe3ef;
  border-radius: 16px;
  background: #f8fbff;
  display: grid;
  gap: 0.8rem;
}

.sidebar-hotel-name {
  margin: 0;
  color: #1e3a8a;
  font-size: 0.92rem;
  font-weight: 700;
}

.sidebar-user-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 42px;
  height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: linear-gradient(135deg, #2563eb, #35b98f);
  color: #fff;
  font-size: 0.95rem;
  font-weight: 700;
  flex: 0 0 auto;
}

.sidebar-user-text {
  min-width: 0;
  display: grid;
  gap: 0.15rem;
}

.sidebar-user-text strong,
.sidebar-user-text small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sidebar-user-text strong {
  color: #0f172a;
  font-size: 0.9rem;
  font-weight: 650;
}

.sidebar-user-text small {
  color: #64748b;
  font-size: 0.78rem;
}

.sidebar-logout {
  margin-top: auto;
  width: 100%;
  min-height: 46px;
  border: 1px solid #dbe3ef;
  border-radius: 14px;
  background: #f8fafc;
  color: #334155;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  font-weight: 600;
  transition: background 0.18s ease, color 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease;
}

.sidebar-logout:hover {
  background: #fee2e2;
  color: #b91c1c;
  transform: translateY(-1px);
  box-shadow: 0 10px 18px rgba(185, 28, 28, 0.08);
}
</style>
