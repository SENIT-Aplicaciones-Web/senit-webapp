import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { AuthenticationApi } from '../infrastructure/authentication.api.js'

const useIamStore = defineStore('iam', () => {
    const users = ref([])
    const currentUser = ref(AuthenticationApi.getCurrentUser())
    const errors = ref([])
    const successMessage = ref('')

    const isAuthenticated = computed(() => currentUser.value !== null)
    const isAdmin = computed(() => currentUser.value?.role === 'ADMIN')
    const isFrontDesk = computed(() => currentUser.value?.role === 'FRONT_DESK')

    async function loadUsers() {
        users.value = await AuthenticationApi.getUsers()
        return users.value
    }

    async function signIn(command) {
        errors.value = []
        successMessage.value = ''

        try {
            const authenticatedUser = await AuthenticationApi.signIn(command)
            if (!authenticatedUser) {
                errors.value.push(new Error('auth.invalid-credentials'))
                return false
            }
            currentUser.value = authenticatedUser
            await loadUsers()
            return true
        } catch (error) {
            errors.value.push(new Error('auth.api-unavailable'))
            return false
        }
    }

    async function signUp(command) {
        errors.value = []
        successMessage.value = ''

        try {
            const registeredUser = await AuthenticationApi.signUp(command)
            if (!registeredUser) {
                errors.value.push(new Error('auth.email-already-exists'))
                return false
            }
            currentUser.value = registeredUser
            await loadUsers()
            successMessage.value = 'auth.registered-successfully'
            return true
        } catch (error) {
            errors.value.push(new Error('auth.api-unavailable'))
            return false
        }
    }

    async function refreshUsers() {
        try {
            users.value = await AuthenticationApi.getUsers()
        } catch (error) {
            users.value = []
        }
    }

    async function changePassword(newPassword) {
        errors.value = []
        successMessage.value = ''
        if (!currentUser.value) return false
        try {
            const updatedUser = await AuthenticationApi.updatePassword(currentUser.value.id, newPassword)
            currentUser.value = updatedUser
            successMessage.value = 'front-desk.settings.password-updated'
            return true
        } catch (error) {
            errors.value.push(new Error('front-desk.settings.password-update-error'))
            return false
        }
    }

    function clearMessages() {
        errors.value = []
        successMessage.value = ''
    }

    function signOut() {
        clearMessages()
        currentUser.value = null
        AuthenticationApi.signOut()
    }

    refreshUsers()

    return {
        users,
        currentUser,
        errors,
        successMessage,
        isAuthenticated,
        isAdmin,
        isFrontDesk,
        loadUsers,
        signIn,
        signUp,
        refreshUsers,
        changePassword,
        clearMessages,
        signOut
    }
})

export default useIamStore
