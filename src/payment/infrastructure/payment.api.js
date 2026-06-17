import { BaseApi } from '../../shared/infrastructure/base-api.js'
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js'
import { PaymentAssembler } from './payment.assembler.js'

/**
 * @summary Handles payment API requests for the payment bounded context.
 */
export class PaymentApi extends BaseEndpoint {
  constructor() {
    super(new BaseApi(), import.meta.env.VITE_PAYMENTS_ENDPOINT_PATH ?? '/payments')
  }

  /**
   * @summary Gets all payments.
   * @returns {Promise<Payment[]>}
   */
  getAllPayments() {
    return this.getAll().then(response => PaymentAssembler.toEntitiesFromResponse(response))
  }

  /**
   * @summary Creates a payment confirmation.
   * @param {object} resource Payment data.
   * @returns {Promise<Payment>}
   */
  createPayment(resource) {
    return this.create(resource).then(response => PaymentAssembler.toEntityFromResource(response.data))
  }
}
