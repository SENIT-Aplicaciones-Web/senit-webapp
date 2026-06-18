/**
 * Represents a booking request inside the Reservation Management bounded context.
 */
export class Reservation {
  constructor({ id, hotelId, roomId, guestName, dni, phone, email, startAt, endAt, status }) {
    this.id = id
    this.hotelId = hotelId
    this.roomId = roomId
    this.guestName = guestName
    this.dni = dni
    this.phone = phone
    this.email = email
    this.startAt = startAt
    this.endAt = endAt
    this.status = status
  }
}
