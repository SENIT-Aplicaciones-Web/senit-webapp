/**
 * Represents the commercial plan attached to a hotel account.
 */
export class Subscription {
  constructor({ id, hotelId, plan, status, monthlyAmount, startedAt, endsAt }) {
    this.id = id
    this.hotelId = hotelId
    this.plan = plan
    this.status = status
    this.monthlyAmount = Number(monthlyAmount ?? 0)
    this.startedAt = startedAt
    this.endsAt = endsAt ?? null
  }
}
