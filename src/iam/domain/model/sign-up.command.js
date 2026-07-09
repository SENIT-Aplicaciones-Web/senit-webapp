export class SignUpCommand {
    constructor({ email = '', username = '', password = '' }) {
        this.email = email
        this.username = username
        this.password = password
    }
}
