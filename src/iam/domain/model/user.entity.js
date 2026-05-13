export class User {
    constructor({
                    id = null,
                    email = '',
                    username = '',
                    role = 'HOTEL_MANAGER'
                }) {
        this.id = id
        this.email = email
        this.username = username
        this.role = role
    }
}