import { BaseApi } from '../../shared/infrastructure/base-api.js'
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js'
import { ReservationAssembler } from './reservation.assembler.js'

/**
 * @summary Handles reservation API requests for the reservation bounded context.
 */
export class ReservationApi extends BaseEndpoint {
  constructor() {
    super(new BaseApi(), import.meta.env.VITE_RESERVATIONS_ENDPOINT_PATH ?? '/reservations')
  }

  /**
   * @summary Gets all reservations.
   * @returns {Promise<Reservation[]>}
   */
  getAllReservations() {
    return this.getAll().then(response => ReservationAssembler.toEntitiesFromResponse(response))
  }

  /**
   * @summary Creates a reservation.
   * @param {object} resource Reservation data.
   * @returns {Promise<Reservation>}
   */
  createReservation(resource) {
    return this.create(resource).then(response => ReservationAssembler.toEntityFromResource(response.data))
  }

  /**
   * @summary Cancels a reservation by updating its status.
   * @param {number|string} id Reservation id.
   * @param {object} resource Reservation data.
   * @returns {Promise<Reservation>}
   */
  updateReservation(id, resource) {
    return this.update(id, resource).then(response => ReservationAssembler.toEntityFromResource(response.data))
  }
}
