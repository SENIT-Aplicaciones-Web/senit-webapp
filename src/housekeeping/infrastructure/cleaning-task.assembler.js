import { CleaningTask } from '../domain/model/cleaning-task.entity.js'

/**
 * @summary Converts cleaning task resources into housekeeping domain entities.
 */
export class CleaningTaskAssembler {
  /**
   * @summary Converts a REST resource into a CleaningTask entity.
   * @param {object} resource Cleaning task resource.
   * @returns {CleaningTask}
   */
  static toEntityFromResource(resource = {}) {
    return new CleaningTask(resource)
  }

  /**
   * @summary Converts an Axios response into CleaningTask entities.
   * @param {import('axios').AxiosResponse|Array} response REST response or resource array.
   * @returns {CleaningTask[]}
   */
  static toEntitiesFromResponse(response) {
    const resources = Array.isArray(response) ? response : response.data
    return (resources ?? []).map(resource => this.toEntityFromResource(resource))
  }
}
