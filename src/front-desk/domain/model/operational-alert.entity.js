export class OperationalAlert {
  constructor({ id, type = 'info', title, message, createdAt, stayId = null, roomId = null, titleKey = null, titleParams = {}, messageKey = null, messageParams = {} } = {}) {
    this.id = id
    this.type = type
    this.title = title
    this.message = message
    this.createdAt = createdAt
    this.stayId = stayId
    this.roomId = roomId
    this.titleKey = titleKey
    this.titleParams = titleParams
    this.messageKey = messageKey
    this.messageParams = messageParams
  }
}
