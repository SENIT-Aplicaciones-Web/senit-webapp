export class User {
    constructor({
                    id = null,
                    hotelId = null,
                    fullName = '',
                    email = '',
                    username = '',
                    role = 'HOTEL_MANAGER',
                    createdAt = ''
                }) {
        this.id = id
        this.hotelId = hotelId
        this.fullName = fullName
        this.email = email
        this.username = username
        this.role = role
        this.createdAt = createdAt
    }
}
