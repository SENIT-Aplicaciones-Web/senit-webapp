import { BaseApi } from '../../shared/infrastructure/base-api.js'
import { FrontDeskAssembler } from './front-desk.assembler.js'

/**
 * @summary Builds dashboard operational models from REST resources required by front-desk screens.
 */
export class FrontDeskApi extends BaseApi {
  constructor() {
    super(import.meta.env.VITE_API_BASE_URL)
    this.roomsPath = import.meta.env.VITE_ROOMS_ENDPOINT_PATH ?? '/rooms'
    this.guestStaysPath = import.meta.env.VITE_GUEST_STAYS_ENDPOINT_PATH ?? '/guest-stays'
    this.notificationsPath = import.meta.env.VITE_NOTIFICATIONS_ENDPOINT_PATH ?? '/notifications'
  }

  /**
   * @summary Gets the dashboard summary using room and stay operational models.
   * @returns {Promise<DashboardSummary>}
   */
  getDashboardSummary() {
    return Promise.all([
      this.http.get(this.roomsPath),
      this.http.get(this.guestStaysPath)
    ]).then(([roomsResponse, staysResponse]) => {
      const rooms = roomsResponse.data ?? []
      const stays = staysResponse.data ?? []
      const occupied = rooms.filter(room => room.status === 'occupied').length
      const totalRooms = rooms.length || 1

      return FrontDeskAssembler.toDashboardSummary({
        availableRooms: rooms.filter(room => room.status === 'available').length,
        totalRooms,
        occupancy: Math.round((occupied / totalRooms) * 100),
        activeStays: stays.filter(stay => stay.status !== 'finished').length,
        endingSoon: 0,
        overdue: 0
      })
    })
  }

  /**
   * @summary Gets operational notifications shown inside Senit.
   * @returns {Promise<OperationalAlert[]>}
   */
  getOperationalAlerts() {
    return this.http.get(this.notificationsPath)
      .then(response => FrontDeskAssembler.toOperationalAlertsFromResponse(response))
  }
}
