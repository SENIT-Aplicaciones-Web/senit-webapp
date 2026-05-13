import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { User } from '../domain/model/user.entity.js'

const mockUsers = ref([
    {
        id: 1,
        email: 'admin@senit.com',
        username: 'admin',
        password: '123456',
        role: 'HOTEL_MANAGER'
    }
])

const useIamStore = defineStore('iam', () => {
    const currentUser = ref(null)
    const errors = ref([])
    const successMessage = ref('')

    const isAuthenticated = computed(() => currentUser.value !== null)

    function signIn(command) {
        errors.value = []
        successMessage.value = ''

        const userFound = mockUsers.value.find(user =>
            user.email === command.email && user.password === command.password
        )

        if (!userFound) {
            errors.value.push(new Error('auth.invalidCredentials'))
            return false
        }

        currentUser.value = new User({
            id: userFound.id,
            email: userFound.email,
            username: userFound.username,
            role: userFound.role
        })

        return true
    }

    function signUp(command) {
        errors.value = []
        successMessage.value = ''

        const newUser = {
            id: mockUsers.value.length + 1,
            email: command.email,
            username: command.username,
            password: command.password,
            role: 'HOTEL_MANAGER'
        }

        mockUsers.value.push(newUser)

        currentUser.value = new User({
            id: newUser.id,
            email: newUser.email,
            username: newUser.username,
            role: newUser.role
        })

        successMessage.value = 'auth.registeredSuccessfully'

        return true
    }

    function signOut() {
        currentUser.value = null
    }

    return {
        currentUser,
        errors,
        successMessage,
        isAuthenticated,
        signIn,
        signUp,
        signOut
    }
})

export default useIamStore