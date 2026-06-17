import { Subscription } from '../domain/model/subscription.entity.js'

/**
 * @summary Converts subscription resources into subscription domain entities.
 */
export class SubscriptionAssembler {
  /**
   * @summary Converts a REST resource into a Subscription entity.
   * @param {object} resource Subscription resource.
   * @returns {Subscription}
   */
  static toEntityFromResource(resource = {}) {
    return new Subscription(resource)
  }

  /**
   * @summary Converts an Axios response into Subscription entities.
   * @param {import('axios').AxiosResponse|Array} response REST response or resource array.
   * @returns {Subscription[]}
   */
  static toEntitiesFromResponse(response) {
    const resources = Array.isArray(response) ? response : response.data
    return (resources ?? []).map(resource => this.toEntityFromResource(resource))
  }

  /**
   * @summary Keeps backwards compatibility with older store code.
   * @param {object} resource Subscription resource.
   * @returns {Subscription}
   */
  static toEntity(resource = {}) {
    return this.toEntityFromResource(resource)
  }
}
