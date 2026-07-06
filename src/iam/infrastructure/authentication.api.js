import { BaseApi } from '../../shared/infrastructure/base-api.js'
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js'
import { hasApiStatus } from '../../shared/infrastructure/api-error-message.js'
import { UserAssembler } from './user.assembler.js'

const CURRENT_USER_KEY = 'senit-webapp-current-user'

const api = new BaseApi()
const usersEndpoint = new BaseEndpoint(api, import.meta.env.VITE_USERS_ENDPOINT_PATH ?? '/users')
const authenticationPath = import.meta.env.VITE_AUTHENTICATION_ENDPOINT_PATH ?? '/authentication'
const hotelsPath = import.meta.env.VITE_HOTELS_ENDPOINT_PATH ?? '/hotels'

function normalizeEmail(email) {
  return String(email ?? '').trim().toLowerCase()
}

function sameId(firstValue, secondValue) {
  return String(firstValue ?? '') === String(secondValue ?? '')
}

function saveCurrentUser(currentUser) {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser))
  localStorage.setItem('senit-webapp-last-access', new Date().toISOString())
}

export class AuthenticationApi {
  static getCurrentUser() {
    const stored = localStorage.getItem(CURRENT_USER_KEY)
    return stored ? JSON.parse(stored) : null
  }

  static async getUsers(hotelId = null) {
    const currentUser = this.getCurrentUser()
    const targetHotelId = hotelId ?? currentUser?.hotelId ?? null
    const endpointPath = targetHotelId
      ? `${usersEndpoint.endpointPath}?hotelId=${encodeURIComponent(targetHotelId)}`
      : usersEndpoint.endpointPath
    const response = await api.http.get(endpointPath)
    return UserAssembler.toEntitiesFromResponse(response)
  }

  static async signIn({ email, password }) {
    try {
      const response = await api.http.post(`${authenticationPath}/sign-in`, {
        email: normalizeEmail(email),
        password
      })
      const currentUser = UserAssembler.toEntity(response.data)
      saveCurrentUser(currentUser)
      return currentUser
    } catch (error) {
      if (hasApiStatus(error, [401, 403, 404])) return null
      throw error
    }
  }


  static async resetPassword(email, newPassword) {
    try {
      await api.http.post(`${authenticationPath}/reset-password`, {
        email: normalizeEmail(email),
        newPassword
      })
      return true
    } catch (error) {
      if (hasApiStatus(error, [404])) return false
      throw error
    }
  }

  static async signUp(command) {
    try {
      const response = await api.http.post(`${authenticationPath}/sign-up`, {
        username: String(command.username ?? '').trim(),
        email: normalizeEmail(command.email),
        password: command.password
      })
      const currentUser = UserAssembler.toEntity(response.data)
      saveCurrentUser(currentUser)
      return currentUser
    } catch (error) {
      if (hasApiStatus(error, [409])) return null
      throw error
    }
  }

  static async createUser(userData) {
    try {
      const response = await usersEndpoint.create({
        hotelId: String(userData.hotelId ?? ''),
        fullName: String(userData.fullName ?? '').trim(),
        username: String(userData.username ?? '').trim(),
        email: normalizeEmail(userData.email),
        password: userData.password || '123456',
        role: userData.role,
        status: userData.status ?? 'active'
      })
      return UserAssembler.toEntity(response.data)
    } catch (error) {
      if (hasApiStatus(error, [409])) return null
      throw error
    }
  }

  static async updateUser(userId, userData) {
    try {
      const existingResponse = await usersEndpoint.getById(userId)
      const existing = existingResponse.data
      const response = await usersEndpoint.update(userId, {
        hotelId: String(userData.hotelId ?? existing.hotelId ?? ''),
        fullName: String(userData.fullName ?? existing.fullName ?? '').trim(),
        username: String(userData.username ?? existing.username ?? '').trim(),
        email: normalizeEmail(userData.email ?? existing.email),
        password: userData.password || existing.password || '123456',
        role: userData.role ?? existing.role,
        status: userData.status ?? existing.status ?? 'active'
      })
      const updatedUser = UserAssembler.toEntity(response.data)
      const currentUser = this.getCurrentUser()

      if (currentUser && sameId(currentUser.id, userId)) {
        updatedUser.token = currentUser.token
        saveCurrentUser(updatedUser)
      }

      return updatedUser
    } catch (error) {
      if (hasApiStatus(error, [404, 409])) return null
      throw error
    }
  }

  static async updatePassword(userId, newPassword) {
    const response = await usersEndpoint.getById(userId)
    const user = response.data
    const updatedResponse = await usersEndpoint.update(userId, {
      hotelId: user.hotelId,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      password: newPassword,
      role: user.role,
      status: user.status
    })
    const updatedUser = UserAssembler.toEntity(updatedResponse.data)
    const currentUser = this.getCurrentUser()
    updatedUser.token = currentUser?.token ?? ''
    saveCurrentUser(updatedUser)
    return updatedUser
  }

  static async deleteUser(userId, hotelId = null) {
    const currentUser = this.getCurrentUser()
    if (currentUser && sameId(currentUser.id, userId)) return false

    const targetHotelId = hotelId ?? currentUser?.hotelId
    if (!targetHotelId) return false

    await api.http.delete(`${hotelsPath}/${targetHotelId}/staff/${userId}`)
    return true
  }

  static signOut() {
    localStorage.removeItem(CURRENT_USER_KEY)
    localStorage.removeItem('senit-webapp-last-access')
  }
}
