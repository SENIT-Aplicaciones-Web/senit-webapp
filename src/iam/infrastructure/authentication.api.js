import { BaseApi } from '../../shared/infrastructure/base-api.js'
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js'
import { UserAssembler } from './user.assembler.js'

const CURRENT_USER_KEY = 'senit-webapp-current-user'

const usersEndpoint = new BaseEndpoint(new BaseApi(), import.meta.env.VITE_USERS_ENDPOINT_PATH ?? '/users')
const hotelsEndpoint = new BaseEndpoint(new BaseApi(), import.meta.env.VITE_HOTELS_ENDPOINT_PATH ?? '/hotels')

const DEMO_USERS = [
    {
        id: '1',
        hotelId: '1',
        fullName: 'Usuario Administrativo',
        username: 'administrador',
        email: 'admin@admin.com',
        password: '123456',
        role: 'ADMIN',
        status: 'active',
        createdAt: '2026-06-01T01:00:00.000Z'
    },
    {
        id: '2',
        hotelId: '1',
        fullName: 'Usuario Recepción',
        username: 'recepcion',
        email: 'recepcion@recepcion.com',
        password: '12345',
        role: 'FRONT_DESK',
        status: 'active',
        createdAt: '2026-06-01T02:00:00.000Z'
    }
]

function normalizeEmail(email) {
    return String(email ?? '').trim().toLowerCase()
}

function nextId(items) {
    const numericIds = items.map(item => Number(item.id)).filter(Number.isFinite)
    return numericIds.length ? Math.max(...numericIds) + 1 : 1
}

function sameId(firstValue, secondValue) {
    return String(firstValue ?? '') === String(secondValue ?? '')
}

function findDemoUser(email, password) {
    const normalizedEmail = normalizeEmail(email)

    const userFound = DEMO_USERS.find(user =>
        normalizeEmail(user.email) === normalizedEmail &&
        user.password === password &&
        user.status !== 'inactive'
    )

    return userFound ? UserAssembler.toEntity(userFound) : null
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

    static async getUsers() {
        const response = await usersEndpoint.getAll()
        return UserAssembler.toEntitiesFromResponse(response)
    }

    static async signIn({ email, password }) {
        try {
            const response = await usersEndpoint.getAll()
            const users = response.data ?? []
            const normalizedEmail = normalizeEmail(email)

            const userFound = users.find(user =>
                normalizeEmail(user.email) === normalizedEmail &&
                user.password === password &&
                user.status !== 'inactive'
            )

            if (userFound) {
                const currentUser = UserAssembler.toEntity(userFound)
                saveCurrentUser(currentUser)
                return currentUser
            }

            const demoUser = findDemoUser(email, password)

            if (demoUser) {
                saveCurrentUser(demoUser)
                return demoUser
            }

            return null
        } catch (error) {
            const demoUser = findDemoUser(email, password)

            if (demoUser) {
                saveCurrentUser(demoUser)
                return demoUser
            }

            return null
        }
    }

    static async signUp(command) {
        const response = await usersEndpoint.getAll()
        const users = response.data ?? []
        const email = normalizeEmail(command.email)

        if (users.some(user => normalizeEmail(user.email) === email)) return null

        const createdHotelResponse = await hotelsEndpoint.create({
            name: `Hotel de ${command.username.trim()}`,
            ruc: '',
            address: '',
            phone: '',
            email,
            plan: 'Basic',
            createdAt: new Date().toISOString()
        })

        const newUser = {
            id: nextId(users),
            hotelId: createdHotelResponse.data.id,
            fullName: command.username.trim(),
            email,
            username: command.username.trim(),
            password: command.password,
            role: 'ADMIN',
            status: 'active',
            createdAt: new Date().toISOString()
        }

        const createdResponse = await usersEndpoint.create(newUser)
        const currentUser = UserAssembler.toEntity(createdResponse.data)
        saveCurrentUser(currentUser)
        return currentUser
    }

    static async createUser(userData) {
        const response = await usersEndpoint.getAll()
        const users = response.data ?? []
        const email = normalizeEmail(userData.email)
        if (users.some(user => normalizeEmail(user.email) === email)) return null

        const newUser = {
            id: nextId(users),
            hotelId: userData.hotelId ?? 1,
            fullName: userData.fullName.trim(),
            username: userData.username.trim(),
            email,
            password: userData.password || '123456',
            role: userData.role,
            status: 'active',
            createdAt: new Date().toISOString()
        }

        const createdResponse = await usersEndpoint.create(newUser)
        return UserAssembler.toEntity(createdResponse.data)
    }

    static async updateUser(userId, userData) {
        const response = await usersEndpoint.getAll()
        const users = response.data ?? []
        const existing = users.find(item => sameId(item.id, userId))
        if (!existing) return null

        const email = normalizeEmail(userData.email)
        if (users.some(item => normalizeEmail(item.email) === email && !sameId(item.id, userId))) return null

        const updatedUser = {
            ...existing,
            fullName: userData.fullName.trim(),
            username: userData.username.trim(),
            email,
            role: userData.role ?? existing.role,
            password: userData.password || existing.password,
            status: userData.status ?? existing.status,
            createdAt: existing.createdAt ?? new Date().toISOString()
        }

        const updatedResponse = await usersEndpoint.update(userId, updatedUser)
        const currentUser = this.getCurrentUser()

        if (currentUser && sameId(currentUser.id, userId)) {
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(UserAssembler.toEntity(updatedResponse.data)))
        }

        return UserAssembler.toEntity(updatedResponse.data)
    }

    static async updatePassword(userId, newPassword) {
        const response = await usersEndpoint.getById(userId)
        const user = response.data
        const updatedResponse = await usersEndpoint.update(userId, { ...user, password: newPassword })
        const updatedUser = UserAssembler.toEntity(updatedResponse.data)
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser))
        return updatedUser
    }

    static async deleteUser(userId) {
        const currentUser = this.getCurrentUser()
        if (currentUser && sameId(currentUser.id, userId)) return false
        await usersEndpoint.delete(userId)
        return true
    }

    static signOut() {
        localStorage.removeItem(CURRENT_USER_KEY)
    }
}