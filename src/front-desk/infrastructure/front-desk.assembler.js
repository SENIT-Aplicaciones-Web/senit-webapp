import { DashboardSummary } from '../domain/model/dashboard-summary.entity.js'
import { OperationalAlert } from '../domain/model/operational-alert.entity.js'

/**
 * @summary Converts operational resources used by front-desk dashboards and alerts.
 */
export class FrontDeskAssembler {
  /**
   * @summary Converts a computed summary resource into a DashboardSummary entity.
   * @param {object} resource Summary resource.
   * @returns {DashboardSummary}
   */
  static toDashboardSummary(resource = {}) {
    return new DashboardSummary(resource)
  }

  /**
   * @summary Converts a notification resource into an OperationalAlert entity.
   * @param {object} resource Notification resource.
   * @returns {OperationalAlert}
   */
  static toOperationalAlert(resource = {}) {
    return new OperationalAlert(resource)
  }

  /**
   * @summary Converts an Axios response into OperationalAlert entities.
   * @param {import('axios').AxiosResponse|Array} response REST response or resource array.
   * @returns {OperationalAlert[]}
   */
  static toOperationalAlertsFromResponse(response) {
    const resources = Array.isArray(response) ? response : response.data
    return (resources ?? []).map(resource => this.toOperationalAlert(resource))
  }
}
