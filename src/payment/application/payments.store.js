import { computed } from 'vue'
import { defineStore } from 'pinia'
import useHotelOperationsDataContextStore from '../../shared/application/hotel-operations.store.js'
import { PaymentApi } from '../infrastructure/payment.api.js'

/**
 * @summary Application store for payment confirmation, invoices and checkout closure.
 */
const usePaymentsStore = defineStore('payments', () => {
  const dataContext = useHotelOperationsDataContextStore()
  const paymentApi = new PaymentApi()

  const activeHotel = computed(() => dataContext.activeHotel)
  const payments = computed(() => dataContext.payments)

  /**
   * @summary Gets the stay that will be charged in checkout.
   * @param {number|string} stayId Stay id.
   * @returns {object|null}
   */
  function getStayById(stayId) {
    return dataContext.getStayById(stayId)
  }

  function addConsumption(stayId, consumptionData) {
    return dataContext.addConsumption(stayId, consumptionData)
  }

  function updateConsumption(consumptionId, consumptionData) {
    return dataContext.updateConsumption(consumptionId, consumptionData)
  }

  function deleteConsumption(consumptionId) {
    return dataContext.deleteConsumption(consumptionId)
  }

  /**
   * @summary Confirms a payment and updates the operational payment context.
   * @param {number|string} stayId Stay id.
   * @param {string} method Payment method.
   * @returns {{ok: boolean, message: string, payment?: object}}
   */
  function confirmPayment(stayId, method) {
    return dataContext.confirmPayment(stayId, method)
  }

  /**
   * @summary Emits a PDF invoice and closes the stay after payment is confirmed.
   * @param {number|string} stayId Stay id.
   * @returns {{ok: boolean, message: string, invoice?: object, stay?: object}}
   */
  function issueInvoiceAndFinishStay(stayId) {
    return dataContext.issueInvoiceAndFinishStay(stayId)
  }

  /**
   * @summary Loads payments from the fake REST API when the service is running.
   * @returns {Promise<Payment[]>}
   */
  function fetchPayments() {
    return paymentApi.getAllPayments()
  }

  return {
    activeHotel,
    payments,
    getStayById,
    addConsumption,
    updateConsumption,
    deleteConsumption,
    confirmPayment,
    issueInvoiceAndFinishStay,
    fetchPayments
  }
})

export default usePaymentsStore
