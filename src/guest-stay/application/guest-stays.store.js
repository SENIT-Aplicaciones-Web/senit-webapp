import { computed } from 'vue'
import { defineStore } from 'pinia'
import useHotelOperationsDataContextStore from '../../shared/application/hotel-operations.store.js'
import { GuestStayApi } from '../infrastructure/guest-stay.api.js'

/**
 * @summary Application store for check-in, active stays, details and consumptions.
 */
const useGuestStaysStore = defineStore('guest-stays', () => {
  const dataContext = useHotelOperationsDataContextStore()
  const guestStayApi = new GuestStayApi()

  const staysWithDetails = computed(() => dataContext.staysWithDetails)
  const activeStaysWithDetails = computed(() => dataContext.activeStaysWithDetails)
  const endingSoonStays = computed(() => dataContext.endingSoonStays)
  const overdueStays = computed(() => dataContext.overdueStays)
  const availableRooms = computed(() => dataContext.availableRooms)
  const dashboardStats = computed(() => dataContext.dashboardStats)
  const hasProPlan = computed(() => dataContext.hasProPlan)

  /**
   * @summary Gets rooms available for a check-in duration without colliding with future reservations.
   * @param {number} hours Stay duration in hours.
   * @returns {object[]} Rooms available for immediate check-in.
   */
  function getAvailableRoomsForCheckIn(hours) {
    return dataContext.getAvailableRoomsForCheckIn(hours)
  }

  /**
   * @summary Checks if a room can be used for an immediate check-in.
   * @param {object} checkInSchedule Check-in room and duration data.
   * @returns {{valid: boolean, message: string}} Validation result.
   */
  function validateCheckInAvailability(checkInSchedule) {
    return dataContext.validateCheckInAvailability(checkInSchedule)
  }

  /**
   * @summary Gets a room by id for the check-in form.
   * @param {number|string} roomId Room id.
   * @returns {object|null}
   */
  function getRoomById(roomId) {
    return dataContext.getRoomById(roomId)
  }

  /**
   * @summary Gets a stay decorated with room, payment and consumption data.
   * @param {number|string} stayId Stay id.
   * @returns {object|null}
   */
  function getStayById(stayId) {
    return dataContext.getStayById(stayId)
  }

  /**
   * @summary Registers a check-in without redirecting automatically to checkout.
   * @param {object} checkInData Check-in form data.
   * @returns {{ok: boolean, message: string, stay?: object}}
   */
  function createCheckIn(checkInData) {
    return dataContext.createCheckIn(checkInData)
  }

  /**
   * @summary Adds a consumption to an active stay.
   * @param {number|string} stayId Stay id.
   * @param {object} consumptionData Consumption form data.
   * @returns {{ok: boolean, message: string, consumption?: object}}
   */
  function addConsumption(stayId, consumptionData) {
    return dataContext.addConsumption(stayId, consumptionData)
  }

  /**
   * @summary Loads guest stays from the fake REST API when the service is running.
   * @returns {Promise<GuestStay[]>}
   */
  function fetchGuestStays() {
    return guestStayApi.getAllGuestStays()
  }

  return {
    staysWithDetails,
    activeStaysWithDetails,
    endingSoonStays,
    overdueStays,
    availableRooms,
    dashboardStats,
    hasProPlan,
    getAvailableRoomsForCheckIn,
    validateCheckInAvailability,
    getRoomById,
    getStayById,
    createCheckIn,
    addConsumption,
    fetchGuestStays
  }
})

export default useGuestStaysStore
