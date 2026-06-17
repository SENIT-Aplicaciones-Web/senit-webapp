/**
 * Represents the commercial plan attached to a hotel account.
 */
export class Subscription {
  constructor({ id, hotelId, plan, status, startedAt }) {
    this.id = Number(id)
    this.hotelId = Number(hotelId)
    this.plan = plan
    this.status = status
    this.startedAt = startedAt
  }
}
