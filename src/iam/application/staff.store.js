import { computed } from 'vue'
import { defineStore } from 'pinia'
import useHotelOperationsDataContextStore from '../../shared/application/hotel-operations.store.js'
import { AuthenticationApi } from '../infrastructure/authentication.api.js'

const useStaffStore = defineStore('staff', () => {
  const dataContext = useHotelOperationsDataContextStore()
  const activeHotel = computed(() => dataContext.activeHotel)

  async function createStaffUser(staffUserData) {
    const email = staffUserData.email?.trim().toLowerCase()
    if (!staffUserData.fullName?.trim()) return { ok: false, message: 'admin.staff.validation.full-name' }
    if (!staffUserData.username?.trim()) return { ok: false, message: 'admin.staff.validation.username' }
    if (!email || !email.includes('@')) return { ok: false, message: 'admin.staff.validation.email' }

    const createdUser = await AuthenticationApi.createUser({
      ...staffUserData,
      hotelId: activeHotel.value?.id ?? ''
    })
    if (!createdUser) return { ok: false, message: 'admin.staff.validation.duplicate-email' }
    return { ok: true, message: 'admin.staff.created-successfully', user: createdUser }
  }

  async function updateStaffUser(userId, staffUserData) {
    const updatedUser = await AuthenticationApi.updateUser(userId, staffUserData)
    if (!updatedUser) return { ok: false, message: 'admin.staff.validation.update-error' }
    return { ok: true, message: 'admin.staff.updated-successfully', user: updatedUser }
  }

  async function deleteStaffUser(userId) {
    const deleted = await AuthenticationApi.deleteUser(userId, activeHotel.value?.id)
    if (!deleted) return { ok: false, message: 'admin.staff.validation.delete-error' }
    return { ok: true, message: 'admin.staff.deleted-successfully' }
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
