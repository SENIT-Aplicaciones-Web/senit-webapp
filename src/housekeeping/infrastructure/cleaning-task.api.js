import { BaseApi } from '../../shared/infrastructure/base-api.js'
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js'
import { CleaningTaskAssembler } from './cleaning-task.assembler.js'

/**
 * @summary Handles cleaning task API requests for the housekeeping bounded context.
 */
export class CleaningTaskApi extends BaseEndpoint {
  constructor() {
    super(new BaseApi(), import.meta.env.VITE_CLEANING_TASKS_ENDPOINT_PATH ?? '/cleaning-tasks')
  }

  /**
   * @summary Gets all cleaning and maintenance tasks.
   * @returns {Promise<CleaningTask[]>}
   */
  getAllCleaningTasks() {
    return this.getAll().then(response => CleaningTaskAssembler.toEntitiesFromResponse(response))
  }
}
