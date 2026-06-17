import { computed } from 'vue'
import { defineStore } from 'pinia'
import useHotelOperationsDataContextStore from '../../shared/application/hotel-operations.store.js'
import { ReservationApi } from '../infrastructure/reservation.api.js'

/**
 * @summary Application store for reservation registration, search and cancellation.
 */
const useReservationsStore = defineStore('reservations', () => {
  const dataContext = useHotelOperationsDataContextStore()
  const reservationApi = new ReservationApi()

  const reservationsWithDetails = computed(() => dataContext.reservationsWithDetails)
  const activeReservations = computed(() => dataContext.activeReservations)
  const rooms = computed(() => dataContext.rooms)
  const hasProPlan = computed(() => dataContext.hasProPlan)

  /**
   * @summary Checks if a room is available for a reservation period.
   * @param {object} reservationSchedule Reservation availability data.
   * @returns {{valid: boolean, message: string}}
   */
  function validateReservationAvailability(reservationSchedule) {
    return dataContext.validateReservationAvailability(reservationSchedule)
  }

  /**
   * @summary Creates a confirmed reservation.
   * @param {object} reservationData Reservation form data.
   * @returns {{ok: boolean, message: string, reservation?: object}}
   */
  function createReservation(reservationData) {
    return dataContext.createReservation(reservationData)
  }

  /**
   * @summary Cancels an existing reservation.
   * @param {number|string} reservationId Reservation id.
   * @returns {{ok: boolean, message: string}}
   */
  function cancelReservation(reservationId) {
    return dataContext.cancelReservation(reservationId)
  }

  /**
   * @summary Returns the label for a room status used in reservation forms.
   * @param {string} status Room status.
   * @returns {string}
   */
  function getRoomStatusLabel(status) {
    return dataContext.getRoomStatusLabel(status)
  }

  /**
   * @summary Loads reservations from the fake REST API when the service is running.
   * @returns {Promise<Reservation[]>}
   */
  function fetchReservations() {
    return reservationApi.getAllReservations()
  }

  return {
    reservationsWithDetails,
    activeReservations,
    rooms,
    hasProPlan,
    validateReservationAvailability,
    createReservation,
    cancelReservation,
    getRoomStatusLabel,
    fetchReservations
  }
})

export default useReservationsStore
