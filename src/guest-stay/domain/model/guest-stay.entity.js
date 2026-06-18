/**
 * Represents a guest stay/check-in lifecycle inside the Guest Stay Management bounded context.
 */
export class GuestStay {
  constructor({
    id,
    hotelId,
    roomId,
    guestId,
    guest,
    guestName,
    checkInAt,
    checkOutLimitAt,
    checkedOutAt,
    startAt,
    expectedEndAt,
    actualEndAt,
    hours,
    initialAmount,
    baseAmount,
    paymentStatus,
    paymentMethod,
    status
  } = {}) {
    this.id = id
    this.hotelId = hotelId
    this.roomId = roomId
    this.guestId = guestId ?? null
    this.guest = guest ?? { fullName: guestName ?? '' }
    this.checkInAt = checkInAt ?? startAt
    this.checkOutLimitAt = checkOutLimitAt ?? expectedEndAt
    this.checkedOutAt = checkedOutAt ?? actualEndAt ?? null
    this.hours = Number(hours ?? 0)
    this.initialAmount = Number(initialAmount ?? baseAmount ?? 0)
    this.paymentStatus = paymentStatus
    this.paymentMethod = paymentMethod
    this.status = status
  }
}
