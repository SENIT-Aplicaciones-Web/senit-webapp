import { computed } from 'vue'
import { defineStore } from 'pinia'
import useHotelOperationsDataContextStore from '../../shared/application/hotel-operations.store.js'
import { CleaningTaskApi } from '../infrastructure/cleaning-task.api.js'

/**
 * @summary Application store for housekeeping cleaning and maintenance tasks.
 */
const useCleaningTasksStore = defineStore('cleaning-tasks', () => {
  const dataContext = useHotelOperationsDataContextStore()
  const cleaningTaskApi = new CleaningTaskApi()

  const cleaningTasks = computed(() => dataContext.cleaningTasks)

  /**
   * @summary Loads cleaning tasks from the fake REST API when the service is running.
   * @returns {Promise<CleaningTask[]>}
   */
  function fetchCleaningTasks() {
    return cleaningTaskApi.getAllCleaningTasks()
  }

  return {
    cleaningTasks,
    fetchCleaningTasks
  }
})

export default useCleaningTasksStore
