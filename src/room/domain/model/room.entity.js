/**
 * Represents a registered hotel room inside the Room Management bounded context.
 */
export class Room {
  constructor({ id, hotelId, number, floor, type, capacity, pricePerHour, status }) {
    this.id = Number(id)
    this.hotelId = Number(hotelId)
    this.number = String(number)
    this.floor = Number(floor)
    this.type = type
    this.capacity = Number(capacity)
    this.pricePerHour = Number(pricePerHour)
    this.status = status
  }
}
