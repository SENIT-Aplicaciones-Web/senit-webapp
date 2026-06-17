/**
 * Represents a payment registered for a guest stay inside the Subscription and Payment Management bounded context.
 */
export class Payment {
  constructor({ id, stayId, amount, method, status, paidAt }) {
    this.id = Number(id)
    this.stayId = Number(stayId)
    this.amount = Number(amount)
    this.method = method
    this.status = status
    this.paidAt = paidAt
  }
}
