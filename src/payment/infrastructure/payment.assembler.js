import { Payment } from '../domain/model/payment.entity.js'

/**
 * @summary Converts payment resources into payment domain entities.
 */
export class PaymentAssembler {
  /**
   * @summary Converts a REST resource into a Payment entity.
   * @param {object} resource Payment resource.
   * @returns {Payment}
   */
  static toEntityFromResource(resource = {}) {
    return new Payment(resource)
  }

  /**
   * @summary Converts an Axios response into Payment entities.
   * @param {import('axios').AxiosResponse|Array} response REST response or resource array.
   * @returns {Payment[]}
   */
  static toEntitiesFromResponse(response) {
    const resources = Array.isArray(response) ? response : response.data
    return (resources ?? []).map(resource => this.toEntityFromResource(resource))
  }

  /**
   * @summary Converts a Payment entity into a REST resource.
   * @param {Payment|object} entity Payment entity.
   * @returns {object}
   */
  static toResourceFromEntity(entity = {}) {
    return { ...entity }
  }
}
