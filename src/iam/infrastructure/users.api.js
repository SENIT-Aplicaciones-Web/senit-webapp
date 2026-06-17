import { BaseApi } from '../../shared/infrastructure/base-api.js'
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js'
import { UserAssembler } from './user.assembler.js'

/**
 * @summary Handles user API requests for identity and access management.
 */
export class UsersApi extends BaseEndpoint {
  constructor() {
    super(new BaseApi(), import.meta.env.VITE_USERS_ENDPOINT_PATH ?? '/users')
  }

  /**
   * @summary Gets all users from the fake API.
   * @returns {Promise<User[]>}
   */
  getAllUsers() {
    return this.getAll().then(response => UserAssembler.toEntitiesFromResponse(response))
  }

  /**
   * @summary Creates a staff user.
   * @param {object} resource User data.
   * @returns {Promise<User>}
   */
  createUser(resource) {
    return this.create(resource).then(response => UserAssembler.toEntity(response.data))
  }

  /**
   * @summary Updates user data or role.
   * @param {number|string} id User id.
   * @param {object} resource User data.
   * @returns {Promise<User>}
   */
  updateUser(id, resource) {
    return this.update(id, resource).then(response => UserAssembler.toEntity(response.data))
  }
}
