import { BaseApi } from '../../shared/infrastructure/base-api.js'
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js'
import { RoomAssembler } from './room.assembler.js'

/**
 * @summary Handles room API requests for the room bounded context.
 */
export class RoomApi extends BaseEndpoint {
  constructor() {
    super(new BaseApi(), import.meta.env.VITE_ROOMS_ENDPOINT_PATH ?? '/rooms')
  }

  /**
   * @summary Gets all registered rooms.
   * @returns {Promise<Room[]>}
   */
  getAllRooms() {
    return this.getAll().then(response => RoomAssembler.toEntitiesFromResponse(response))
  }

  /**
   * @summary Updates a room state or data.
   * @param {number|string} id Room id.
   * @param {object} resource Room data.
   * @returns {Promise<Room>}
   */
  updateRoom(id, resource) {
    return this.update(id, resource).then(response => RoomAssembler.toEntityFromResponse(response.data))
  }
}
