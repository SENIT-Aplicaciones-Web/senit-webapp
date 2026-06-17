import { computed } from 'vue'
import { defineStore } from 'pinia'
import useHotelOperationsDataContextStore from '../../shared/application/hotel-operations.store.js'
import { SubscriptionApi } from '../infrastructure/subscription.api.js'

/**
 * @summary Application store for hotel plan and subscription information.
 */
const useSubscriptionsStore = defineStore('subscriptions', () => {
  const dataContext = useHotelOperationsDataContextStore()
  const subscriptionApi = new SubscriptionApi()

  const activeHotel = computed(() => dataContext.activeHotel)
  const currentPlan = computed(() => activeHotel.value?.plan ?? 'Basic')
  const hasProPlan = computed(() => dataContext.hasProPlan)
  const paymentHistory = computed(() => dataContext.getSubscriptionPayments())

  function updateSubscription(planName) {
    return dataContext.updateSubscription(planName)
  }

  /**
   * @summary Loads subscriptions from the fake REST API when the service is running.
   * @returns {Promise<Subscription[]>}
   */
  function fetchSubscriptions() {
    return subscriptionApi.getAllSubscriptions()
  }

  return {
    activeHotel,
    currentPlan,
    paymentHistory,
    hasProPlan,
    updateSubscription,
    fetchSubscriptions
  }
})

export default useSubscriptionsStore
