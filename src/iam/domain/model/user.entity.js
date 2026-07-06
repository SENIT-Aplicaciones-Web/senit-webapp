export class User {
  constructor({
    id = null,
    hotelId = null,
    fullName = '',
    email = '',
    username = '',
    role = 'FRONT_DESK',
    status = 'active',
    createdAt = '',
    token = ''
  } = {}) {
    this.id = id
    this.hotelId = hotelId
    this.fullName = fullName
    this.email = email
    this.username = username
    this.role = role
    this.status = status
    this.createdAt = createdAt
    this.token = token
  }
}
