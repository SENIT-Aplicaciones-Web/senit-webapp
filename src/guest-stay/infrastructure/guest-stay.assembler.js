import { GuestStay } from '../domain/model/guest-stay.entity.js'

/**
 * @summary Converts guest stay resources into guest stay domain entities.
 */
export class GuestStayAssembler {
  /**
   * @summary Converts a REST resource into a GuestStay entity.
   * @param {object} resource Guest stay resource.
   * @returns {GuestStay}
   */
  static toEntityFromResource(resource = {}) {
    return new GuestStay(resource)
  }

  /**
   * @summary Converts an Axios response into GuestStay entities.
   * @param {import('axios').AxiosResponse|Array} response REST response or resource array.
   * @returns {GuestStay[]}
   */
  static toEntitiesFromResponse(response) {
    const resources = Array.isArray(response) ? response : response.data
    return (resources ?? []).map(resource => this.toEntityFromResource(resource))
  }

  /**
   * @summary Converts a GuestStay entity into a REST resource.
   * @param {GuestStay|object} entity Guest stay entity.
   * @returns {object}
   */
  static toResourceFromEntity(entity = {}) {
    return { ...entity }
  }
}
