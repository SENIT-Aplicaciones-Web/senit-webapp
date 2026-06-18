/**
 * @summary Reusable CRUD endpoint implementation for the Senit REST API.
 */
export class BaseEndpoint {
  /**
   * @summary Creates an endpoint adapter from a BaseApi instance and an endpoint path.
   * @param {BaseApi} baseApi Shared API client wrapper.
   * @param {string} endpointPath Endpoint path, for example /rooms.
   */
  constructor(baseApi, endpointPath) {
    this.http = baseApi.http
    this.endpointPath = endpointPath
  }

  /**
   * @summary Executes GET of all resources.
   * @returns {Promise<import('axios').AxiosResponse>}
   */
  getAll() {
    return this.http.get(this.endpointPath)
  }

  /**
   * @summary Executes GET by id request.
   * @param {number|string} id Resource id.
   * @returns {Promise<import('axios').AxiosResponse>}
   */
  getById(id) {
    return this.http.get(`${this.endpointPath}/${id}`)
  }

  /**
   * @summary Executes POST request to create a resource.
   * @param {object} resource Resource data.
   * @returns {Promise<import('axios').AxiosResponse>}
   */
  create(resource) {
    return this.http.post(this.endpointPath, resource)
  }

  /**
   * @summary Executes PUT request to replace a resource.
   * @param {number|string} id Resource id.
   * @param {object} resource Resource data.
   * @returns {Promise<import('axios').AxiosResponse>}
   */
  update(id, resource) {
    return this.http.put(`${this.endpointPath}/${id}`, resource)
  }

  /**
   * @summary Executes PATCH request to partially update a resource.
   * @param {number|string} id Resource id.
   * @param {object} resource Partial resource data.
   * @returns {Promise<import('axios').AxiosResponse>}
   */
  patch(id, resource) {
    return this.http.patch(`${this.endpointPath}/${id}`, resource)
  }

  /**
   * @summary Executes DELETE request.
   * @param {number|string} id Resource id.
   * @returns {Promise<import('axios').AxiosResponse>}
   */
  delete(id) {
    return this.http.delete(`${this.endpointPath}/${id}`)
  }
}
