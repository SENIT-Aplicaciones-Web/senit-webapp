import { BaseApi } from '../../shared/infrastructure/base-api.js'
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js'
import { GuestStayAssembler } from './guest-stay.assembler.js'

/**
 * @summary Handles guest stay API requests for check-in and stay tracking.
 */
export class GuestStayApi extends BaseEndpoint {
  constructor() {
    super(new BaseApi(), import.meta.env.VITE_GUEST_STAYS_ENDPOINT_PATH ?? '/guest-stays')
  }

  /**
   * @summary Gets all guest stays.
   * @returns {Promise<GuestStay[]>}
   */
  getAllGuestStays() {
    return this.getAll().then(response => GuestStayAssembler.toEntitiesFromResponse(response))
  }

  /**
   * @summary Creates a guest stay after check-in.
   * @param {object} resource Guest stay data.
   * @returns {Promise<GuestStay>}
   */
  createGuestStay(resource) {
    return this.create(resource).then(response => GuestStayAssembler.toEntityFromResource(response.data))
  }

  /**
   * @summary Updates a guest stay during checkout or payment flow.
   * @param {number|string} id Guest stay id.
   * @param {object} resource Guest stay data.
   * @returns {Promise<GuestStay>}
   */
  updateGuestStay(id, resource) {
    return this.update(id, resource).then(response => GuestStayAssembler.toEntityFromResource(response.data))
  }
}
