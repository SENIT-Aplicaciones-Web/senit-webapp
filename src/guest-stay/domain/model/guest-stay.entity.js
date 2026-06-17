/**
 * Represents a guest stay/check-in lifecycle inside the Guest Stay Management bounded context.
 */
export class GuestStay {
  constructor({ id, hotelId, roomId, guestId, guest, checkInAt, checkOutLimitAt, checkedOutAt, hours, initialAmount, paymentStatus, paymentMethod, status }) {
    this.id = Number(id)
    this.hotelId = Number(hotelId)
    this.roomId = Number(roomId)
    this.guestId = guestId ? Number(guestId) : null
    this.guest = guest
    this.checkInAt = checkInAt
    this.checkOutLimitAt = checkOutLimitAt
    this.checkedOutAt = checkedOutAt ?? null
    this.hours = Number(hours)
    this.initialAmount = Number(initialAmount)
    this.paymentStatus = paymentStatus
    this.paymentMethod = paymentMethod
    this.status = status
  }
}
