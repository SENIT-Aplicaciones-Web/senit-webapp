export class SignUpCommand {
    constructor({ email = '', username = '', password = '', plan = 'Basic' }) {
        this.email = email
        this.username = username
        this.password = password
        this.plan = plan === 'Pro' ? 'Pro' : 'Basic'
    }
}
