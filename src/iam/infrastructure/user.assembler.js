import { User } from '../domain/model/user.entity.js'

/**
 * @summary Converts user resources into IAM domain entities.
 */
export class UserAssembler {
  /**
   * @summary Converts a REST resource into a User entity.
   * @param {object} resource User resource.
   * @returns {User}
   */
  static toEntity(resource = {}) {
    return new User({
      id: resource.id,
      hotelId: resource.hotelId,
      fullName: resource.fullName,
      email: resource.email,
      username: resource.username,
      role: resource.role,
      status: resource.status,
      createdAt: resource.createdAt
    })
  }

  /**
   * @summary Converts an Axios response into User entities.
   * @param {import('axios').AxiosResponse|Array} response REST response or resource array.
   * @returns {User[]}
   */
  static toEntitiesFromResponse(response) {
    const resources = Array.isArray(response) ? response : response.data
    return (resources ?? []).map(resource => this.toEntity(resource))
  }

  /**
   * @summary Converts a User entity into a safe REST resource.
   * @param {User|object} user User entity.
   * @returns {object}
   */
  static toResource(user = {}) {
    return {
      id: user.id,
      hotelId: user.hotelId,
      fullName: user.fullName,
      email: user.email,
      username: user.username,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt
    }
  }
}
