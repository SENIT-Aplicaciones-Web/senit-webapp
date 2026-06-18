<script setup>
import { computed, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import useHotelOperationsStore from '../../../application/staff.store.js'
import useIamStore from '../../../application/iam.store.js'
import { formatDateTime } from '../../../../shared/domain/services/date-format.service.js'

const operationsStore = useHotelOperationsStore()
const iamStore = useIamStore()
const { t } = useI18n()
const feedback = ref({ type: '', message: '' })
const rowFeedback = reactive({})
const editingUserId = ref(null)
const searchTerm = ref('')
const roleFilter = ref('all')
const form = reactive({ fullName: '', username: '', email: '', role: 'FRONT_DESK', password: '123456' })
const editForm = reactive({ fullName: '', username: '', email: '', role: 'FRONT_DESK', password: '' })
const roleOptions = computed(() => [
  { label: t('front-desk.navigation.role-reception'), value: 'FRONT_DESK' },
  { label: t('front-desk.navigation.role-admin'), value: 'ADMIN' }
])
const roleFilterOptions = computed(() => [
  { label: t('front-desk.rooms.all'), value: 'all' },
  ...roleOptions.value
])

function sameId(firstValue, secondValue) {
  return String(firstValue ?? '') === String(secondValue ?? '')
}

const staff = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()
  return iamStore.users.filter(user => {
    const matchesHotel = !operationsStore.activeHotel?.id || sameId(user.hotelId, operationsStore.activeHotel.id)
    const matchesText = !term || user.fullName?.toLowerCase().includes(term) || user.email?.toLowerCase().includes(term) || user.username?.toLowerCase().includes(term)
    const matchesRole = roleFilter.value === 'all' || user.role === roleFilter.value
    return matchesHotel && matchesText && matchesRole
  })
})

async function saveStaffUser() {
  const result = await operationsStore.createStaffUser(form)
  feedback.value = { type: result.ok ? 'success' : 'error', message: result.message }
  if (result.ok) {
    await iamStore.refreshUsers()
    Object.assign(form, { fullName: '', username: '', email: '', role: 'FRONT_DESK', password: '123456' })
  }
}

function setRowFeedback(userId, type, message) { rowFeedback[userId] = { type, message } }
function startEdit(user) {
  editingUserId.value = user.id
  Object.assign(editForm, { fullName: user.fullName || '', username: user.username || '', email: user.email || '', role: user.role || 'FRONT_DESK', password: '' })
}
function cancelEdit() { editingUserId.value = null }
async function saveEdit(user) {
  const result = await operationsStore.updateStaffUser(user.id, editForm)
  setRowFeedback(user.id, result.ok ? 'success' : 'error', result.message)
  if (result.ok) { await iamStore.refreshUsers(); editingUserId.value = null }
}
function getInitials(user) {
  const source = user.fullName || user.username || user.email || 'SN'
  const cleanSource = source.trim()
  const first = cleanSource[0]?.toUpperCase() ?? 'S'
  const spaceIndex = cleanSource.indexOf(' ')
  const second = spaceIndex >= 0 ? cleanSource[spaceIndex + 1]?.toUpperCase() : cleanSource[1]?.toUpperCase()
  return `${first}${second || 'N'}`
}

function registeredAtLabel(user) {
  return user.createdAt ? formatDateTime(user.createdAt) : '-'
}

async function deleteUser(user) {
  const result = await operationsStore.deleteStaffUser(user.id)
  setRowFeedback(user.id, result.ok ? 'success' : 'error', result.message)
  if (result.ok) await iamStore.refreshUsers()
}

function resolveFeedbackMessage(message) {
  return /^[a-z0-9.-]+$/.test(message ?? '') ? t(message) : message
}
</script>

<template>
  <section class="page-shell">
    <section class="page-header"><div><h1>{{ t('admin.staff.title') }}</h1><p>{{ t('admin.staff.subtitle') }}</p></div></section>

    <article class="form-card admin-full-card">
      <div class="panel-header"><h2>{{ t('admin.staff.new-staff-user') }}</h2></div>
      <form class="form-grid admin-staff-form" @submit.prevent="saveStaffUser">
        <div class="form-field full"><label>{{ t('admin.staff.full-name') }}</label><pv-input-text v-model="form.fullName" required /></div>
        <div class="form-field"><label>{{ t('admin.staff.username') }}</label><pv-input-text v-model="form.username" required /></div>
        <div class="form-field"><label>{{ t('admin.staff.email') }}</label><pv-input-text v-model="form.email" required /></div>
        <div class="form-field"><label>{{ t('admin.staff.role') }}</label><pv-select v-model="form.role" :options="roleOptions" option-label="label" option-value="value" /></div>
        <div class="form-field"><label>{{ t('admin.staff.initial-password') }}</label><pv-input-text v-model="form.password" /></div>
        <div class="form-field full"><button class="primary-button" type="submit"><i class="pi pi-user-plus"></i>{{ t('admin.staff.register-user') }}</button></div>
      </form>
      <p v-if="feedback.message" class="feedback slim-feedback" :class="feedback.type">{{ resolveFeedbackMessage(feedback.message) }}</p>
    </article>

    <article class="panel-card admin-full-card">
      <div class="panel-header">
        <div><h2>{{ t('admin.staff.registered-users') }}</h2><p class="help-message">{{ t('admin.staff.registered-subtitle') }}</p></div>
        <span class="room-badge">{{ staff.length }}</span>
      </div>
      <div class="admin-staff-controls named-filters">
        <div class="filter-control wide">
          <label>{{ t('admin.staff.search-label') }}</label>
          <div class="input-with-icon">
            <input v-model="searchTerm" type="text" :placeholder="t('admin.staff.search-placeholder-short')" />
            <button type="button" :aria-label="t('shared.actions.search')"><i class="pi pi-search"></i></button>
          </div>
        </div>
        <div class="filter-control">
          <label>{{ t('admin.staff.role-filter') }}</label>
          <pv-select v-model="roleFilter" :options="roleFilterOptions" option-label="label" option-value="value" />
        </div>
      </div>
      <div class="admin-staff-list">
        <article v-for="user in staff" :key="user.id" class="admin-staff-row">
          <div class="staff-identity">
            <span class="staff-avatar">{{ getInitials(user) }}</span>
            <span class="staff-text">
              <strong>{{ user.fullName || user.username }}</strong>
              <small>{{ user.email }}</small>
            </span>
          </div>
          <div class="staff-role-meta">
            <span class="status-badge role-badge" :class="user.role === 'ADMIN' ? 'admin-role' : 'active'">{{ user.role === 'ADMIN' ? t('front-desk.navigation.role-admin') : t('front-desk.navigation.role-reception') }}</span>
            <small>{{ t('admin.staff.registered-at') }}</small>
            <small>{{ registeredAtLabel(user) }}</small>
          </div>
          <div class="row-actions action-pair">
            <button class="mini-button edit-button" type="button" @click="startEdit(user)"><i class="pi pi-pencil"></i>{{ t('shared.actions.edit') }}</button>
            <button class="danger-ghost-button" type="button" @click="deleteUser(user)"><i class="pi pi-trash"></i>{{ t('shared.actions.delete') }}</button>
          </div>
          <p v-if="rowFeedback[user.id]?.message" class="inline-feedback" :class="rowFeedback[user.id].type">{{ resolveFeedbackMessage(rowFeedback[user.id].message) }}</p>
          <div v-if="editingUserId === user.id" class="inline-edit-panel">
            <div class="inline-edit-grid">
              <div class="form-field"><label>{{ t('admin.staff.full-name') }}</label><pv-input-text v-model="editForm.fullName" /></div>
              <div class="form-field"><label>{{ t('admin.staff.username') }}</label><pv-input-text v-model="editForm.username" /></div>
              <div class="form-field"><label>{{ t('admin.staff.email') }}</label><pv-input-text v-model="editForm.email" /></div>
              <div class="form-field"><label>{{ t('admin.staff.role') }}</label><pv-select v-model="editForm.role" :options="roleOptions" option-label="label" option-value="value" /></div>
              <div class="form-field"><label>{{ t('admin.staff.optional-password') }}</label><pv-input-text v-model="editForm.password" /></div>
              <div class="form-field" style="justify-content:end;">
                <div class="actions-row">
                  <button class="success-button" type="button" @click="saveEdit(user)"><i class="pi pi-check"></i>{{ t('shared.actions.save') }}</button>
                  <button class="ghost-button" type="button" @click="cancelEdit">{{ t('shared.actions.cancel') }}</button>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
    </article>
  </section>
</template>

<style scoped>
.admin-staff-form {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.admin-staff-list {
  display: grid;
  gap: 0.8rem;
}

.admin-staff-row {
  grid-template-columns: minmax(280px, 1fr) minmax(130px, auto) auto;
  align-items: center;
}

.staff-identity {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  min-width: 0;
}

.staff-avatar {
  width: 42px;
  height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #eef5ff;
  color: #1e3a8a;
  font-weight: 700;
  flex: 0 0 auto;
}

.staff-text {
  min-width: 0;
  display: grid;
  gap: 0.15rem;
}

.staff-text strong,
.staff-text small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.row-actions button {
  min-width: 110px;
}

.staff-role-meta {
  display: grid;
  gap: 0.2rem;
  justify-items: start;
  color: #64748b;
  font-size: 0.78rem;
}

@media (max-width: 1000px) {
  .admin-staff-form,
  .admin-staff-row {
    grid-template-columns: 1fr;
  }
}
</style>
