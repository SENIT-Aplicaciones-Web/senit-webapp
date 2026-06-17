export class DashboardSummary {
  constructor({
    checkInsToday = 0,
    checkOutsToday = 0,
    availableRooms = 0,
    totalRooms = 0,
    occupancy = 0,
    activeStays = 0,
    endingSoon = 0,
    overdue = 0
  } = {}) {
    this.checkInsToday = checkInsToday
    this.checkOutsToday = checkOutsToday
    this.availableRooms = availableRooms
    this.totalRooms = totalRooms
    this.occupancy = occupancy
    this.activeStays = activeStays
    this.endingSoon = endingSoon
    this.overdue = overdue
  }
}
