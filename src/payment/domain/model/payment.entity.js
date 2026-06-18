/**
 * Represents a payment registered for a guest stay or reservation.
 */
export class Payment {
  constructor({ id, hotelId, stayId, guestStayId, reservationId, amount, method, status, paidAt }) {
    this.id = id
    this.hotelId = hotelId
    this.stayId = stayId ?? guestStayId ?? null
    this.guestStayId = guestStayId ?? stayId ?? null
    this.reservationId = reservationId ?? null
    this.amount = Number(amount)
    this.method = method
    this.status = status
    this.paidAt = paidAt
  }
}
