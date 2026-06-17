import { computed } from 'vue'
import { defineStore } from 'pinia'
import useHotelOperationsDataContextStore from '../../shared/application/hotel-operations.store.js'
import { FrontDeskApi } from '../infrastructure/front-desk.api.js'

/**
 * @summary Application store for the front-desk bounded context.
 */
const useFrontDeskStore = defineStore('front-desk', () => {
  const dataContext = useHotelOperationsDataContextStore()
  const frontDeskApi = new FrontDeskApi()

  /**
   * @summary Current hotel displayed in reception and administration shells.
   */
  const activeHotel = computed(() => dataContext.activeHotel)

  /**
   * @summary Real-time operational notifications used by internal app alerts.
   */
  const internalNotifications = computed(() => dataContext.internalNotifications)

  /**
   * @summary Dashboard statistics computed from rooms, stays and payments.
   */
  const dashboardStats = computed(() => dataContext.dashboardStats)

  const activeReservations = computed(() => dataContext.activeReservations)
  const roomsWithDetails = computed(() => dataContext.roomsWithDetails)
  const activeStaysWithDetails = computed(() => dataContext.activeStaysWithDetails)
  const endingSoonStays = computed(() => dataContext.endingSoonStays)
  const overdueStays = computed(() => dataContext.overdueStays)
  const availableRooms = computed(() => dataContext.availableRooms)
  const now = computed(() => dataContext.now)
  const rooms = computed(() => dataContext.rooms)
  const payments = computed(() => dataContext.payments)
  const hasProPlan = computed(() => dataContext.hasProPlan)

  /**
   * @summary Searches across the reception dashboard operational model.
   * @param {string} term Search term.
   * @returns {{stays: Array, reservations: Array, rooms: Array}}
   */
  function searchEverywhere(term) {
    return dataContext.searchEverywhere(term)
  }

  /**
   * @summary Updates the active hotel profile.
   * @param {object} hotelData Hotel form data.
   * @returns {{ok: boolean, message: string}}
   */
  function updateHotel(hotelData) {
    return dataContext.updateHotel(hotelData)
  }

  /**
   * @summary Loads the dashboard operational model from the REST API when needed.
   * @returns {Promise<DashboardSummary>}
   */
  function fetchDashboardSummary() {
    return frontDeskApi.getDashboardSummary()
  }

  /**
   * @summary Loads operational notifications from the REST API when needed.
   * @returns {Promise<OperationalAlert[]>}
   */
  function fetchOperationalAlerts() {
    return frontDeskApi.getOperationalAlerts()
  }

  return {
    activeHotel,
    internalNotifications,
    dashboardStats,
    activeReservations,
    roomsWithDetails,
    activeStaysWithDetails,
    endingSoonStays,
    overdueStays,
    availableRooms,
    now,
    rooms,
    payments,
    hasProPlan,
    searchEverywhere,
    updateHotel,
    fetchDashboardSummary,
    fetchOperationalAlerts
  }
})

export default useFrontDeskStore
