import { Room } from '../domain/model/room.entity.js'

/**
 * @summary Converts room resources into room domain entities.
 */
export class RoomAssembler {
  /**
   * @summary Converts a REST resource into a Room entity.
   * @param {object} resource Room resource.
   * @returns {Room}
   */
  static toEntityFromResource(resource = {}) {
    return new Room(resource)
  }

  /**
   * @summary Converts an Axios response into Room entities.
   * @param {import('axios').AxiosResponse|Array} response REST response or resource array.
   * @returns {Room[]}
   */
  static toEntitiesFromResponse(response) {
    const resources = Array.isArray(response) ? response : response.data
    return (resources ?? []).map(resource => this.toEntityFromResource(resource))
  }

  /**
   * @summary Converts a Room entity into a REST resource.
   * @param {Room|object} entity Room entity.
   * @returns {object}
   */
  static toResourceFromEntity(entity = {}) {
    return { ...entity }
  }
}
