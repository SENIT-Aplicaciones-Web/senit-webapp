export class OperationalAlert {
  constructor({ id, type = 'info', title, message, createdAt, read = false, stayId = null, roomId = null } = {}) {
    this.id = id
    this.type = type
    this.title = title
    this.message = message
    this.createdAt = createdAt
    this.read = read
    this.stayId = stayId
    this.roomId = roomId
  }
}
