import { Reservation } from '../domain/model/reservation.entity.js'

/**
 * @summary Converts reservation resources into reservation domain entities.
 */
export class ReservationAssembler {
  /**
   * @summary Converts a REST resource into a Reservation entity.
   * @param {object} resource Reservation resource.
   * @returns {Reservation}
   */
  static toEntityFromResource(resource = {}) {
    return new Reservation(resource)
  }

  /**
   * @summary Converts an Axios response into Reservation entities.
   * @param {import('axios').AxiosResponse|Array} response REST response or resource array.
   * @returns {Reservation[]}
   */
  static toEntitiesFromResponse(response) {
    const resources = Array.isArray(response) ? response : response.data
    return (resources ?? []).map(resource => this.toEntityFromResource(resource))
  }

  /**
   * @summary Converts a Reservation entity into a REST resource.
   * @param {Reservation|object} entity Reservation entity.
   * @returns {object}
   */
  static toResourceFromEntity(entity = {}) {
    return { ...entity }
  }
}
