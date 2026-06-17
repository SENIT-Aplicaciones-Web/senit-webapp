/**
 * Represents a cleaning task inside the Housekeeping Management bounded context.
 */
export class CleaningTask {
  constructor({ id, roomId, title, status, createdAt, completedAt }) {
    this.id = Number(id)
    this.roomId = Number(roomId)
    this.title = title
    this.status = status
    this.createdAt = createdAt
    this.completedAt = completedAt ?? null
  }
}
