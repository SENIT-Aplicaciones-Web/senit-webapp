import axios from 'axios'

const CURRENT_USER_KEY = 'senit-webapp-current-user'
const LOCALE_KEY = 'senit-webapp-locale'

function getStoredCurrentUser() {
  if (typeof localStorage === 'undefined') return null

  try {
    const stored = localStorage.getItem(CURRENT_USER_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

function getStoredLocale() {
  if (typeof localStorage === 'undefined') return 'es'
  return localStorage.getItem(LOCALE_KEY) || 'es'
}

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

    this.http.interceptors.request.use(config => {
      const currentUser = getStoredCurrentUser()
      const token = currentUser?.token

      config.headers = config.headers ?? {}
      config.headers['Accept-Language'] = getStoredLocale()

      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      } else {
        delete config.headers.Authorization
      }

      return config
    })
  }
}
