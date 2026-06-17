import axios from 'axios'

/**
 * @summary Provides a reusable Axios instance for every bounded context API.
 */
export class BaseApi {
  /**
   * @summary Creates the Axios client using the Vite API base URL.
   * @param {string} baseUrl Base URL configured in .env files.
   */
  constructor(baseUrl = import.meta.env.VITE_API_BASE_URL) {
    this.http = axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}
