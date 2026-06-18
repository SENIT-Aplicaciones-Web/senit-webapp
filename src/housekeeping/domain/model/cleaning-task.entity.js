/**
 * Represents a cleaning task inside the Housekeeping Management bounded context.
 */
export class CleaningTask {
  constructor({ id, hotelId, roomId, title, description, status, createdAt, completedAt, updatedAt }) {
    this.id = id
    this.hotelId = hotelId
    this.roomId = roomId
    this.title = title ?? description
    this.description = description ?? title
    this.status = status
    this.createdAt = createdAt
    this.completedAt = completedAt ?? updatedAt ?? null
  }
}
