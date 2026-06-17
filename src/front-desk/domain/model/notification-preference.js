export class NotificationPreference {
  constructor({ internalAlerts = true, stayExpirationAlerts = true, paymentAlerts = true } = {}) {
    this.internalAlerts = Boolean(internalAlerts)
    this.stayExpirationAlerts = Boolean(stayExpirationAlerts)
    this.paymentAlerts = Boolean(paymentAlerts)
  }

  static default() {
    return new NotificationPreference()
  }
}
