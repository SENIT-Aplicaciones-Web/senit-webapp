import { computed } from 'vue'
import { defineStore } from 'pinia'
import useHotelOperationsDataContextStore from '../../shared/application/hotel-operations.store.js'
import { AuthenticationApi } from '../infrastructure/authentication.api.js'
import { getApiErrorMessage } from '../../shared/infrastructure/api-error-message.js'

const useStaffStore = defineStore('staff', () => {
  const dataContext = useHotelOperationsDataContextStore()
  const activeHotel = computed(() => dataContext.activeHotel)

  async function createStaffUser(staffUserData) {
    const email = staffUserData.email?.trim().toLowerCase()
    if (!staffUserData.fullName?.trim()) return { ok: false, message: 'admin.staff.validation.full-name' }
    const username = staffUserData.username?.trim()
    if (!username) return { ok: false, message: 'admin.staff.validation.username' }
    if (!/^[A-Za-z0-9_]+$/.test(username)) return { ok: false, message: 'admin.staff.validation.username-format' }
    if (!email || !email.includes('@')) return { ok: false, message: 'admin.staff.validation.email' }

    try {
      const createdUser = await AuthenticationApi.createUser({
        ...staffUserData,
        hotelId: activeHotel.value?.id ?? ''
      })
      if (!createdUser) return { ok: false, message: 'admin.staff.validation.duplicate-email' }
      return { ok: true, message: 'admin.staff.created-successfully', user: createdUser }
    } catch (error) {
      return { ok: false, message: getApiErrorMessage(error, 'admin.staff.validation.duplicate-email') }
    }
  }

  async function updateStaffUser(userId, staffUserData) {
    try {
      const updatedUser = await AuthenticationApi.updateUser(userId, staffUserData)
      if (!updatedUser) return { ok: false, message: 'admin.staff.validation.update-error' }
      return { ok: true, message: 'admin.staff.updated-successfully', user: updatedUser }
    } catch (error) {
      return { ok: false, message: getApiErrorMessage(error, 'admin.staff.validation.update-error') }
    }
  }

  async function deleteStaffUser(userId) {
    try {
      const deleted = await AuthenticationApi.deleteUser(userId, activeHotel.value?.id)
      if (!deleted) return { ok: false, message: 'admin.staff.validation.delete-error' }
      return { ok: true, message: 'admin.staff.deleted-successfully' }
    } catch (error) {
      return { ok: false, message: getApiErrorMessage(error, 'admin.staff.validation.delete-error') }
    }
  }

  async function fetchUsers() {
    return AuthenticationApi.getUsers(activeHotel.value?.id)
  }

  return {
    activeHotel,
    createStaffUser,
    updateStaffUser,
    deleteStaffUser,
    fetchUsers
  }
})

export default useStaffStore
