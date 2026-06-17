import { BaseApi } from '../../shared/infrastructure/base-api.js'
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js'
import { SubscriptionAssembler } from './subscription.assembler.js'

/**
 * @summary Handles subscription API requests for the subscription-payment bounded context.
 */
export class SubscriptionApi extends BaseEndpoint {
  constructor() {
    super(new BaseApi(), import.meta.env.VITE_SUBSCRIPTIONS_ENDPOINT_PATH ?? '/subscriptions')
  }

  /**
   * @summary Gets all hotel subscription records.
   * @returns {Promise<Subscription[]>}
   */
  getAllSubscriptions() {
    return this.getAll().then(response => SubscriptionAssembler.toEntitiesFromResponse(response))
  }
}
