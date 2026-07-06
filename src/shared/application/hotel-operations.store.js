import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { BaseApi } from '../infrastructure/base-api.js'
import { BaseEndpoint } from '../infrastructure/base-endpoint.js'
import { getApiErrorMessage } from '../infrastructure/api-error-message.js'
import { addHours, formatDateTime, getRemainingMilliseconds, isSameDay } from '../domain/services/date-format.service.js'
import useIamStore from '../../iam/application/iam.store.js'

function normalize(value) {
  return String(value ?? '').trim().toLowerCase()
}

function money(value) {
  return Number(Number(value || 0).toFixed(2))
}

function sameId(firstValue, secondValue) {
  return String(firstValue ?? '') === String(secondValue ?? '')
}

function getErrorMessage(error, fallback) {
  return getApiErrorMessage(error, fallback)
}

function getReservationRuntimeStatus(reservation, referenceDate = new Date()) {
  if (!reservation) return 'unknown'
  if (reservation.status === 'cancelled' || reservation.status === 'completed') return reservation.status
  const endTime = new Date(reservation.endAt).getTime()
  if (!Number.isNaN(endTime) && endTime < referenceDate.getTime()) return 'completed'
  return reservation.status ?? 'confirmed'
}

function getReservationHours(startAt, endAt) {
  const start = new Date(startAt).getTime()
  const end = new Date(endAt).getTime()
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return 0
  return (end - start) / (60 * 60 * 1000)
}

function hasWholeHourDuration(startAt, endAt) {
  const hours = getReservationHours(startAt, endAt)
  return Number.isInteger(hours) && hours > 0
}

function getStayRuntimeStatus(stay, now = new Date()) {
  if (!stay) return 'unknown'
  if (stay.status === 'finished' || stay.checkedOutAt) return 'finished'

  const milliseconds = getRemainingMilliseconds(stay.checkOutLimitAt, now)
  if (milliseconds < 0) return 'overdue'
  if (milliseconds <= 15 * 60 * 1000) return 'endingSoon'
  return 'active'
}

function getRoomRuntimeStatusFromStay(stayStatus) {
  if (stayStatus === 'overdue') return 'overdue'
  if (stayStatus === 'endingSoon') return 'endingSoon'
  if (stayStatus === 'finished') return 'available'
  return 'occupied'
}

const useHotelOperationsStore = defineStore('hotel-operations', () => {
  const iamStore = useIamStore()
  const api = new BaseApi()
  const hotelsEndpoint = new BaseEndpoint(api, import.meta.env.VITE_HOTELS_ENDPOINT_PATH ?? '/hotels')
  const roomsEndpoint = new BaseEndpoint(api, import.meta.env.VITE_ROOMS_ENDPOINT_PATH ?? '/rooms')
  const reservationsEndpoint = new BaseEndpoint(api, import.meta.env.VITE_RESERVATIONS_ENDPOINT_PATH ?? '/reservations')
  const guestsEndpoint = new BaseEndpoint(api, import.meta.env.VITE_GUESTS_ENDPOINT_PATH ?? '/guests')
  const guestStaysEndpoint = new BaseEndpoint(api, import.meta.env.VITE_GUEST_STAYS_ENDPOINT_PATH ?? '/guest-stays')
  const consumptionsEndpoint = new BaseEndpoint(api, import.meta.env.VITE_CONSUMPTIONS_ENDPOINT_PATH ?? '/consumptions')
  const paymentsEndpoint = new BaseEndpoint(api, import.meta.env.VITE_PAYMENTS_ENDPOINT_PATH ?? '/payments')
  const invoicesEndpoint = new BaseEndpoint(api, import.meta.env.VITE_INVOICES_ENDPOINT_PATH ?? '/invoices')
  const cleaningTasksEndpoint = new BaseEndpoint(api, import.meta.env.VITE_CLEANING_TASKS_ENDPOINT_PATH ?? '/cleaning-tasks')
  const notificationsEndpoint = new BaseEndpoint(api, import.meta.env.VITE_NOTIFICATIONS_ENDPOINT_PATH ?? '/notifications')
  const subscriptionsEndpoint = new BaseEndpoint(api, import.meta.env.VITE_SUBSCRIPTIONS_ENDPOINT_PATH ?? '/subscriptions')
  const subscriptionPaymentsEndpoint = new BaseEndpoint(api, import.meta.env.VITE_SUBSCRIPTION_PAYMENTS_ENDPOINT_PATH ?? '/subscription-payments')

  const hotels = ref([])
  const rooms = ref([])
  const reservations = ref([])
  const guests = ref([])
  const guestStays = ref([])
  const consumptions = ref([])
  const payments = ref([])
  const invoices = ref([])
  const cleaningTasks = ref([])
  const notifications = ref([])
  const subscriptions = ref([])
  const subscriptionPayments = ref([])
  const now = ref(new Date())

  if (typeof window !== 'undefined') {
    window.setInterval(() => {
      now.value = new Date()
    }, 1000)
  }

  loadFromApi()

  watch(
    () => iamStore.currentUser?.hotelId,
    () => loadFromApi()
  )

  const activeHotel = computed(() => {
    const currentHotelId = iamStore.currentUser?.hotelId
    return hotels.value.find(hotel => sameId(hotel.id, currentHotelId)) ?? null
  })

  const activeSubscription = computed(() => {
    const hotelId = activeHotel.value?.id
    return hotelId ? subscriptions.value.find(subscription => sameId(subscription.hotelId, hotelId) && subscription.status !== 'inactive') ?? null : null
  })

  const currentPlan = computed(() => activeSubscription.value?.plan ?? activeHotel.value?.plan ?? 'Basic')
  const hasProPlan = computed(() => currentPlan.value === 'Pro')

  const hotelRooms = computed(() => {
    const hotelId = activeHotel.value?.id
    return hotelId ? rooms.value.filter(room => sameId(room.hotelId, hotelId)) : []
  })

  const hotelGuestStays = computed(() => {
    const hotelId = activeHotel.value?.id
    return hotelId ? guestStays.value.filter(stay => sameId(stay.hotelId, hotelId)) : []
  })

  const hotelReservations = computed(() => {
    const hotelId = activeHotel.value?.id
    return hotelId ? reservations.value.filter(reservation => sameId(reservation.hotelId, hotelId)) : []
  })

  const staysWithDetails = computed(() =>
    hotelGuestStays.value.map(stay => decorateStay(stay))
  )

  const activeGuestStays = computed(() =>
    staysWithDetails.value.filter(stay => stay.status !== 'finished')
  )

  const activeStaysWithDetails = computed(() => activeGuestStays.value)

  const endingSoonStays = computed(() =>
    activeStaysWithDetails.value.filter(stay => stay.status === 'endingSoon')
  )

  const overdueStays = computed(() =>
    activeStaysWithDetails.value.filter(stay => stay.status === 'overdue')
  )

  const availableRooms = computed(() =>
    hotelRooms.value.filter(room => room.status === 'available')
  )

  const roomsWithDetails = computed(() =>
    hotelRooms.value.map(room => {
      const activeStay = activeStaysWithDetails.value.find(stay => sameId(stay.roomId, room.id))
      const status = activeStay
        ? getRoomRuntimeStatusFromStay(activeStay.status)
        : room.status === 'occupied'
          ? 'cleaning'
          : room.status
      return {
        ...room,
        status: activeStay ? room.status : status,
        runtimeStatus: status,
        guestName: activeStay?.guest?.fullName ?? '',
        stayId: activeStay?.id ?? null,
        statusLabel: getRoomStatusLabel(status)
      }
    })
  )

  const reservationsWithDetails = computed(() =>
    hotelReservations.value.map(reservation => {
      const runtimeStatus = getReservationRuntimeStatus(reservation, now.value)
      return {
        ...reservation,
        runtimeStatus,
        room: getRoomById(reservation.roomId),
        statusLabel: getReservationStatusLabel(runtimeStatus)
      }
    })
  )

  const activeReservations = computed(() =>
    reservationsWithDetails.value.filter(reservation => reservation.runtimeStatus === 'confirmed')
  )

  const dashboardStats = computed(() => {
    const checkInsToday = staysWithDetails.value.filter(stay => isSameDay(stay.checkInAt, now.value)).length
    const checkOutsToday = staysWithDetails.value.filter(stay => stay.checkedOutAt && isSameDay(stay.checkedOutAt, now.value)).length
    const occupied = roomsWithDetails.value.filter(room => ['occupied', 'endingSoon', 'overdue'].includes(room.runtimeStatus)).length
    const totalRooms = hotelRooms.value.length || 1
    const available = hotelRooms.value.filter(room => room.status === 'available').length

    return {
      checkInsToday,
      checkOutsToday,
      availableRooms: available,
      totalRooms,
      occupancy: Math.round((occupied / totalRooms) * 100),
      activeStays: activeGuestStays.value.length,
      endingSoon: endingSoonStays.value.length,
      overdue: overdueStays.value.length
    }
  })

  const internalNotifications = computed(() => {
    const automatic = [
      ...overdueStays.value.map(stay => ({
        id: `overdue-${stay.id}`,
        type: 'danger',
        titleKey: 'front-desk.dashboard.checkout-pending-title',
        titleParams: { room: stay.room?.number ?? '-' },
        messageKey: 'front-desk.dashboard.checkout-pending-message',
        messageParams: { guest: stay.guest.fullName },
        createdAt: stay.checkOutLimitAt,
        stayId: stay.id,
        roomId: stay.roomId
      })),
      ...endingSoonStays.value.map(stay => ({
        id: `ending-${stay.id}`,
        type: 'warning',
        titleKey: 'front-desk.dashboard.ending-soon-title',
        titleParams: { room: stay.room?.number ?? '-' },
        messageKey: 'front-desk.dashboard.ending-soon-message',
        messageParams: { guest: stay.guest.fullName },
        createdAt: stay.checkOutLimitAt,
        stayId: stay.id,
        roomId: stay.roomId
      }))
    ]
    const hotelId = activeHotel.value?.id
    const hotelNotifications = hotelId ? notifications.value.filter(notification => sameId(notification.hotelId, hotelId)) : []
    return [...automatic, ...hotelNotifications].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  })

  async function loadFromApi() {
    if (!iamStore.currentUser?.token) {
      return
    }

    try {
      const currentHotelId = iamStore.currentUser?.hotelId
      const hotelParams = currentHotelId ? { hotelId: currentHotelId } : {}

      const responses = await Promise.all([
        hotelsEndpoint.getAll(),
        roomsEndpoint.getAll(hotelParams),
        reservationsEndpoint.getAll(hotelParams),
        guestsEndpoint.getAll(hotelParams),
        guestStaysEndpoint.getAll(hotelParams),
        consumptionsEndpoint.getAll(hotelParams),
        paymentsEndpoint.getAll(hotelParams),
        invoicesEndpoint.getAll(hotelParams),
        cleaningTasksEndpoint.getAll(hotelParams),
        notificationsEndpoint.getAll(hotelParams),
        subscriptionsEndpoint.getAll(hotelParams).catch(() => ({ data: [] })),
        subscriptionPaymentsEndpoint.getAll(hotelParams).catch(() => ({ data: [] }))
      ])

      hotels.value = responses[0].data ?? []
      rooms.value = (responses[1].data ?? []).map(normalizeRoom)
      reservations.value = (responses[2].data ?? []).map(normalizeReservation)
      guests.value = responses[3].data ?? []
      guestStays.value = (responses[4].data ?? []).map(normalizeGuestStay)
      consumptions.value = (responses[5].data ?? []).map(normalizeConsumption)
      payments.value = (responses[6].data ?? []).map(normalizePayment)
      invoices.value = (responses[7].data ?? []).map(normalizeInvoice)
      cleaningTasks.value = (responses[8].data ?? []).map(normalizeCleaningTask)
      notifications.value = (responses[9].data ?? []).map(normalizeNotification)
      subscriptions.value = responses[10].data ?? []
      subscriptionPayments.value = responses[11].data ?? []
    } catch (error) {
      console.warn('Senit API is not available. Check VITE_API_BASE_URL and run the backend.', error)
    }
  }

  function normalizeRoom(room = {}) {
    return { ...room, status: room.status === 'blocked' ? 'maintenance' : room.status }
  }

  function normalizeReservation(reservation = {}) {
    return {
      ...reservation,
      hours: Number(reservation.hours ?? getReservationHours(reservation.startAt, reservation.endAt)),
      reservationAmount: money(reservation.reservationAmount ?? 0),
      prepaidAmount: money(reservation.prepaidAmount ?? 0)
    }
  }

  function normalizeGuestStay(stay = {}) {
    const startAt = stay.checkInAt ?? stay.startAt
    const expectedEndAt = stay.checkOutLimitAt ?? stay.expectedEndAt
    const baseAmount = money(stay.initialAmount ?? stay.baseAmount ?? 0)
    return {
      ...stay,
      checkInAt: startAt,
      checkOutLimitAt: expectedEndAt,
      checkedOutAt: stay.checkedOutAt ?? stay.actualEndAt ?? null,
      initialAmount: baseAmount,
      baseAmount,
      guest: stay.guest ?? { fullName: stay.guestName ?? '' },
      paymentStatus: stay.paymentStatus ?? 'pending'
    }
  }

  function normalizeConsumption(consumption = {}) {
    const stayId = consumption.stayId ?? consumption.guestStayId
    return {
      ...consumption,
      stayId,
      guestStayId: stayId,
      amount: money(consumption.amount ?? Number(consumption.quantity ?? 0) * Number(consumption.unitPrice ?? 0))
    }
  }

  function normalizePayment(payment = {}) {
    const stayId = payment.stayId ?? payment.guestStayId
    return {
      ...payment,
      stayId,
      guestStayId: stayId ?? null
    }
  }

  function normalizeInvoice(invoice = {}) {
    const payment = payments.value.find(item => sameId(item.id, invoice.paymentId))
    return {
      ...invoice,
      stayId: invoice.stayId ?? payment?.stayId ?? payment?.guestStayId ?? null
    }
  }

  function normalizeCleaningTask(task = {}) {
    return {
      ...task,
      title: task.title ?? task.description,
      description: task.description ?? task.title,
      completedAt: task.completedAt ?? task.updatedAt ?? null
    }
  }

  function normalizeNotification(notification = {}) {
    return { ...notification }
  }

  function getReservationById(reservationId) {
    if (!reservationId) return null
    return reservations.value.find(reservation => sameId(reservation.id, reservationId)) ?? null
  }

  function getRoomById(roomId) {
    return rooms.value.find(room => sameId(room.id, roomId)) ?? null
  }

  function getGuestById(guestId) {
    return guests.value.find(guest => sameId(guest.id, guestId)) ?? null
  }

  function getPaymentForStay(stayId) {
    return payments.value.find(payment => sameId(payment.guestStayId, stayId) && payment.status === 'completed') ?? null
  }

  function getInvoiceForStay(stayId) {
    const payment = getPaymentForStay(stayId)
    if (!payment) return null
    return invoices.value.find(invoice => sameId(invoice.paymentId, payment.id)) ?? null
  }

  function getStayById(stayId) {
    const stay = guestStays.value.find(item => sameId(item.id, stayId))
    return stay ? decorateStay(stay) : null
  }

  function getConsumptionTotal(stayId) {
    return consumptions.value
      .filter(consumption => sameId(consumption.guestStayId, stayId))
      .reduce((sum, consumption) => sum + money(consumption.amount ?? Number(consumption.quantity) * Number(consumption.unitPrice)), 0)
  }

  function getStayTotal(stay) {
    const reservation = getReservationById(stay.reservationId)
    const prepaidAmount = money(reservation?.prepaidAmount ?? stay.prepaidAmount ?? 0)
    const accommodationDue = Math.max(Number(stay.initialAmount) - prepaidAmount, 0)
    return money(accommodationDue + getConsumptionTotal(stay.id))
  }

  function getStayConsumptions(stayId) {
    return consumptions.value.filter(consumption => sameId(consumption.guestStayId, stayId))
  }

  function decorateStay(stay) {
    const room = getRoomById(stay.roomId)
    const guest = getGuestById(stay.guestId) ?? stay.guest ?? { fullName: stay.guestName ?? '' }
    const payment = getPaymentForStay(stay.id)
    const invoice = getInvoiceForStay(stay.id)
    const baseStatus = invoice ? 'finished' : stay.status
    const normalizedStay = {
      ...stay,
      guest,
      status: baseStatus,
      checkedOutAt: stay.checkedOutAt ?? (invoice ? invoice.issuedAt : null),
      paymentStatus: payment ? 'paid' : stay.paymentStatus
    }
    const status = getStayRuntimeStatus(normalizedStay, now.value)
    const stayConsumptions = getStayConsumptions(stay.id)
    const reservation = getReservationById(stay.reservationId)
    const prepaidAmount = money(reservation?.prepaidAmount ?? stay.prepaidAmount ?? 0)
    const accommodationDue = money(Math.max(Number(stay.initialAmount) - prepaidAmount, 0))
    const total = payment ? money(payment.amount) : getStayTotal(stay)
    return {
      ...normalizedStay,
      room,
      roomNumber: room?.number ?? '- ',
      status,
      statusLabel: getStayStatusLabel(status),
      payment,
      invoice,
      paymentStatusLabel: normalizedStay.paymentStatus === 'paid' ? 'Pagado' : 'Por pagar',
      consumptions: stayConsumptions,
      consumptionsTotal: money(getConsumptionTotal(stay.id)),
      reservation,
      prepaidAmount,
      accommodationDue,
      total,
      formattedCheckIn: formatDateTime(stay.checkInAt),
      formattedCheckOut: formatDateTime(stay.checkOutLimitAt),
      checkedOutLabel: normalizedStay.checkedOutAt ? formatDateTime(normalizedStay.checkedOutAt) : '-'
    }
  }

  function searchEverywhere(term) {
    const value = normalize(term)
    if (!value) return { stays: [], reservations: [], rooms: [] }

    return {
      stays: staysWithDetails.value.filter(stay =>
        normalize(stay.guest?.fullName).includes(value) ||
        normalize(stay.room?.number).includes(value)
      ),
      reservations: reservationsWithDetails.value.filter(reservation =>
        normalize(reservation.guestName).includes(value) ||
        normalize(reservation.room?.number).includes(value)
      ),
      rooms: roomsWithDetails.value.filter(room =>
        normalize(room.number).includes(value) || normalize(room.type).includes(value)
      )
    }
  }

  function validateReservationAvailability({ roomId, startAt, endAt, reservationId = null }) {
    const start = new Date(startAt).getTime()
    const end = new Date(endAt).getTime()
    const room = getRoomById(roomId)

    if (!room) return { valid: false, message: 'front-desk.validation.valid-room' }
    if (room.status === 'maintenance' || room.status === 'blocked') return { valid: false, message: 'front-desk.validation.room-not-available-reservation' }
    if (!startAt || !endAt || Number.isNaN(start) || Number.isNaN(end) || end <= start) {
      return { valid: false, message: 'front-desk.validation.end-after-start' }
    }
    if (!hasWholeHourDuration(startAt, endAt)) {
      return { valid: false, message: 'front-desk.validation.duration-whole-hours' }
    }

    const hasReservationOverlap = reservations.value.some(reservation => {
      if (reservation.status !== 'confirmed') return false
      if (sameId(reservation.id, reservationId)) return false
      if (!sameId(reservation.roomId, roomId)) return false
      return start < new Date(reservation.endAt).getTime() && end > new Date(reservation.startAt).getTime()
    })

    const hasStayOverlap = activeStaysWithDetails.value.some(stay => {
      if (!sameId(stay.roomId, roomId)) return false
      return start < new Date(stay.checkOutLimitAt).getTime() && end > new Date(stay.checkInAt).getTime()
    })

    if (hasReservationOverlap || hasStayOverlap) {
      return { valid: false, message: 'front-desk.validation.overlapping-booking' }
    }

    return { valid: true, message: '' }
  }

  async function sendNotification({ title, message, type = 'info' }) {
    const hotelId = activeHotel.value?.id
    if (!hotelId) return null
    try {
      const response = await notificationsEndpoint.create({
        hotelId,
        title,
        message,
        type,
        createdBy: iamStore.currentUser?.id ?? null
      })
      const notification = normalizeNotification(response.data)
      notifications.value.unshift(notification)
      return notification
    } catch (error) {
      console.warn('Notification could not be stored.', error)
      return null
    }
  }

  async function createReservation(reservationData) {
    const validation = validateReservationAvailability(reservationData)
    if (!validation.valid) return { ok: false, message: validation.message }

    const room = getRoomById(reservationData.roomId)
    const hours = getReservationHours(reservationData.startAt, reservationData.endAt)
    const reservationAmount = money(hours * Number(room?.pricePerHour ?? 0))

    if (reservationAmount <= 0) return { ok: false, message: 'front-desk.validation.reservation-payment-error' }

    try {
      const reservationResponse = await reservationsEndpoint.create({
        hotelId: activeHotel.value?.id ?? '',
        roomId: reservationData.roomId,
        guestName: reservationData.guestName.trim(),
        dni: reservationData.dni.trim(),
        phone: reservationData.phone.trim(),
        email: reservationData.email.trim(),
        guestsQuantity: Number(reservationData.guestsQuantity ?? 1),
        startAt: reservationData.startAt,
        endAt: reservationData.endAt,
        status: 'confirmed',
        prepaidAmount: reservationAmount,
        paymentMethod: reservationData.paymentMethod ?? 'cash',
        paymentStatus: 'paid',
        paidAt: new Date().toISOString()
      })
      const reservation = normalizeReservation(reservationResponse.data)
      reservations.value.push(reservation)

      const paymentResponse = await paymentsEndpoint.create({
        hotelId: activeHotel.value?.id ?? '',
        guestStayId: null,
        reservationId: reservation.id,
        amount: money(reservation.reservationAmount || reservationAmount),
        method: reservation.paymentMethod,
        status: 'completed',
        paidAt: reservation.paidAt ?? new Date().toISOString()
      })
      payments.value.push(normalizePayment(paymentResponse.data))

      await sendNotification({
        title: 'Nueva reserva registrada',
        message: `${reservation.guestName} fue registrado para la habitación ${getRoomById(reservation.roomId)?.number}.`,
        type: 'success'
      })

      return { ok: true, message: 'front-desk.reservations.created-successfully', reservation }
    } catch (error) {
      return { ok: false, message: getErrorMessage(error, 'front-desk.validation.reservation-payment-error') }
    }
  }

  async function cancelReservation(reservationId) {
    const reservation = reservations.value.find(item => sameId(item.id, reservationId))
    if (!reservation) return { ok: false, message: 'front-desk.reservations.not-found' }
    if (reservation.status === 'cancelled') return { ok: false, message: 'front-desk.reservations.already-cancelled' }

    try {
      const updatedResponse = await reservationsEndpoint.update(reservation.id, {
        ...reservation,
        status: 'cancelled'
      })
      Object.assign(reservation, normalizeReservation(updatedResponse.data))
      await sendNotification({
        title: 'Reserva cancelada',
        message: `Se canceló la reserva de ${reservation.guestName}.`,
        type: 'warning'
      })
      return { ok: true, message: 'front-desk.reservations.cancelled-successfully' }
    } catch (error) {
      return { ok: false, message: getErrorMessage(error, 'front-desk.reservations.not-found') }
    }
  }

  async function createCheckIn(checkInData) {
    const room = getRoomById(checkInData.roomId)
    if (!room) return { ok: false, message: 'front-desk.validation.valid-room' }
    if (room.status !== 'available') return { ok: false, message: 'front-desk.validation.room-not-available' }

    const checkInAt = new Date()
    const hours = Number(checkInData.hours)
    const checkOutLimitAt = addHours(checkInAt, hours)
    const initialAmount = money(hours * Number(room.pricePerHour))

    try {
      const guestResponse = await guestsEndpoint.create({
        fullName: checkInData.fullName.trim(),
        dni: checkInData.dni.trim(),
        phone: checkInData.phone.trim(),
        email: checkInData.email.trim()
      })
      const guest = guestResponse.data
      guests.value.push(guest)

      const stayResponse = await guestStaysEndpoint.create({
        hotelId: activeHotel.value?.id ?? '',
        roomId: checkInData.roomId,
        guestId: guest.id,
        guestName: guest.fullName,
        startAt: checkInAt.toISOString(),
        expectedEndAt: checkOutLimitAt.toISOString(),
        actualEndAt: null,
        status: 'active',
        baseAmount: initialAmount,
        additionalAmount: 0,
        prepaidAmount: 0,
        totalAmount: initialAmount,
        paymentStatus: 'pending'
      })
      const stay = normalizeGuestStay({ ...stayResponse.data, guest })
      guestStays.value.push(stay)
      room.status = 'occupied'

      await sendNotification({
        title: 'Check-in registrado',
        message: `${guest.fullName} ingresó a la habitación ${room.number}.`,
        type: 'success'
      })

      return { ok: true, message: 'front-desk.check-in.created-title', stay: decorateStay(stay) }
    } catch (error) {
      return { ok: false, message: getErrorMessage(error, 'front-desk.validation.room-not-available') }
    }
  }

  async function addConsumption(stayId, consumptionData) {
    const stay = getStayById(stayId)
    if (!stay || stay.status === 'finished') return { ok: false, message: 'front-desk.checkout.validation.open-stay-consumption' }

    const description = consumptionData.description?.trim()
    const quantity = Number(consumptionData.quantity)
    const unitPrice = Number(consumptionData.unitPrice)
    if (!description) return { ok: false, message: 'front-desk.checkout.validation.consumption-name' }
    if (!quantity || quantity <= 0) return { ok: false, message: 'front-desk.checkout.validation.valid-quantity' }
    if (!unitPrice || unitPrice <= 0) return { ok: false, message: 'front-desk.checkout.validation.valid-price' }

    try {
      const response = await consumptionsEndpoint.create({
        guestStayId: stayId,
        description,
        quantity,
        unitPrice: money(unitPrice),
        amount: money(quantity * unitPrice)
      })
      const consumption = normalizeConsumption(response.data)
      consumptions.value.push(consumption)
      return { ok: true, message: 'front-desk.checkout.consumption-added', consumption }
    } catch (error) {
      return { ok: false, message: getErrorMessage(error, 'front-desk.checkout.validation.open-stay-consumption') }
    }
  }

  async function updateConsumption(consumptionId, consumptionData) {
    const consumption = consumptions.value.find(item => sameId(item.id, consumptionId))
    if (!consumption) return { ok: false, message: 'front-desk.checkout.validation.consumption-not-found' }

    const stay = getStayById(consumption.guestStayId)
    if (!stay || stay.status === 'finished') return { ok: false, message: 'front-desk.checkout.validation.finished-consumption-edit' }

    const description = consumptionData.description?.trim()
    const quantity = Number(consumptionData.quantity)
    const unitPrice = Number(consumptionData.unitPrice)
    if (!description) return { ok: false, message: 'front-desk.checkout.validation.consumption-name' }
    if (!quantity || quantity <= 0) return { ok: false, message: 'front-desk.checkout.validation.valid-quantity' }
    if (!unitPrice || unitPrice <= 0) return { ok: false, message: 'front-desk.checkout.validation.valid-price' }

    try {
      const response = await consumptionsEndpoint.update(consumption.id, {
        guestStayId: consumption.guestStayId,
        description,
        quantity,
        unitPrice: money(unitPrice),
        amount: money(quantity * unitPrice)
      })
      Object.assign(consumption, normalizeConsumption(response.data))
      return { ok: true, message: 'front-desk.checkout.consumption-updated', consumption }
    } catch (error) {
      return { ok: false, message: getErrorMessage(error, 'front-desk.checkout.validation.consumption-not-found') }
    }
  }

  async function deleteConsumption(consumptionId) {
    const consumption = consumptions.value.find(item => sameId(item.id, consumptionId))
    if (!consumption) return { ok: false, message: 'front-desk.checkout.validation.consumption-not-found' }

    const stay = getStayById(consumption.guestStayId)
    if (!stay || stay.status === 'finished') return { ok: false, message: 'front-desk.checkout.validation.finished-consumption-delete' }

    try {
      await consumptionsEndpoint.delete(consumptionId)
      consumptions.value = consumptions.value.filter(item => !sameId(item.id, consumptionId))
      return { ok: true, message: 'front-desk.checkout.consumption-deleted' }
    } catch (error) {
      return { ok: false, message: getErrorMessage(error, 'front-desk.checkout.validation.consumption-not-found') }
    }
  }

  async function confirmPayment(stayId, method = 'cash') {
    const stay = getStayById(stayId)
    if (!stay) return { ok: false, message: 'front-desk.checkout.not-found' }
    if (stay.status === 'finished') return { ok: false, message: 'front-desk.checkout.already-finished' }
    if (stay.paymentStatus === 'paid') return { ok: true, message: 'front-desk.checkout.payment-confirmed', payment: stay.payment }

    try {
      const response = await paymentsEndpoint.create({
        hotelId: activeHotel.value?.id ?? '',
        guestStayId: stayId,
        reservationId: null,
        amount: getStayTotal(stay),
        method,
        status: 'completed',
        paidAt: new Date().toISOString()
      })
      const payment = normalizePayment(response.data)
      payments.value.push(payment)
      return { ok: true, message: 'front-desk.checkout.payment-confirmed', payment }
    } catch (error) {
      return { ok: false, message: getErrorMessage(error, 'front-desk.checkout.payment-error') }
    }
  }

  async function issueInvoiceAndFinishStay(stayId) {
    const stay = getStayById(stayId)
    if (!stay) return { ok: false, message: 'front-desk.checkout.not-found' }
    if (stay.paymentStatus !== 'paid') return { ok: false, message: 'front-desk.checkout.confirm-before-receipt' }

    const existingInvoice = getInvoiceForStay(stayId)
    if (existingInvoice) return { ok: true, message: 'front-desk.checkout.receipt-finished', invoice: existingInvoice, stay }

    const payment = getPaymentForStay(stayId)
    if (!payment) return { ok: false, message: 'front-desk.checkout.confirm-before-receipt' }

    try {
      const invoiceResponse = await invoicesEndpoint.create({
        paymentId: payment.id,
        number: `B001-${String(invoices.value.length + 1).padStart(6, '0')}`,
        customerName: stay.guest?.fullName ?? stay.guestName ?? 'Cliente',
        amount: money(payment.amount),
        issuedAt: new Date().toISOString()
      })
      const invoice = normalizeInvoice(invoiceResponse.data)
      invoices.value.push(invoice)

      const room = getRoomById(stay.roomId)
      if (room) {
        const updatedRoom = { ...room, status: 'cleaning' }
        const roomResponse = await roomsEndpoint.update(room.id, updatedRoom)
        Object.assign(room, normalizeRoom(roomResponse.data))
      }

      const cleaningTaskResponse = await cleaningTasksEndpoint.create({
        hotelId: activeHotel.value?.id ?? '',
        roomId: stay.roomId,
        description: `Limpieza post check-out Hab. ${room?.number ?? stay.roomId}`,
        status: 'pending'
      })
      cleaningTasks.value.push(normalizeCleaningTask(cleaningTaskResponse.data))

      await sendNotification({
        title: 'Checkout finalizado',
        message: `La habitación ${room?.number ?? stay.roomId} pasó a limpieza.`,
        type: 'success'
      })

      return { ok: true, message: 'front-desk.checkout.receipt-finished', invoice, stay: getStayById(stayId) }
    } catch (error) {
      return { ok: false, message: getErrorMessage(error, 'front-desk.checkout.receipt-error') }
    }
  }

  async function updateRoomStatus(roomId, status) {
    const room = getRoomById(roomId)
    if (!room) return { ok: false, message: 'admin.rooms.validation.not-found' }

    const hasActiveStay = activeStaysWithDetails.value.some(stay => sameId(stay.roomId, roomId))
    if (hasActiveStay) return { ok: false, message: 'admin.rooms.validation.active-stay-status' }
    if (status === 'occupied') return { ok: false, message: 'admin.rooms.validation.occupied-only-checkin' }

    try {
      const response = await roomsEndpoint.update(room.id, { ...room, status })
      Object.assign(room, normalizeRoom(response.data))

      const openTask = cleaningTasks.value.find(task => sameId(task.roomId, roomId) && task.status === 'pending')
      if (openTask && (status === 'available' || status === 'maintenance')) {
        openTask.status = status === 'available' ? 'completed' : 'maintenance'
        openTask.completedAt = new Date().toISOString()
      }

      return { ok: true, message: 'admin.rooms.status-updated' }
    } catch (error) {
      return { ok: false, message: getErrorMessage(error, 'admin.rooms.validation.not-found') }
    }
  }

  function validateRoomData(roomData, roomId = null) {
    const roomNumber = String(roomData.number ?? '').trim()
    if (!roomNumber) return { valid: false, message: 'admin.rooms.validation.number-required' }
    if (rooms.value.some(room => room.number === roomNumber && !sameId(room.id, roomId))) {
      return { valid: false, message: 'admin.rooms.validation.duplicate-number' }
    }
    if (!['Standard', 'Deluxe', 'Suite'].includes(roomData.type)) return { valid: false, message: 'admin.rooms.validation.valid-type' }
    if (!Number(roomData.floor) || Number(roomData.floor) <= 0) return { valid: false, message: 'admin.rooms.validation.valid-floor' }
    if (!Number(roomData.capacity) || Number(roomData.capacity) <= 0) return { valid: false, message: 'admin.rooms.validation.valid-capacity' }
    if (!Number(roomData.pricePerHour) || Number(roomData.pricePerHour) <= 0) return { valid: false, message: 'admin.rooms.validation.valid-price' }
    return { valid: true, message: '' }
  }

  async function createRoom(roomData) {
    const validation = validateRoomData(roomData)
    if (!validation.valid) return { ok: false, message: validation.message }

    try {
      const response = await roomsEndpoint.create({
        hotelId: activeHotel.value?.id ?? '',
        number: String(roomData.number).trim(),
        floor: Number(roomData.floor),
        type: roomData.type,
        capacity: Number(roomData.capacity),
        pricePerHour: money(roomData.pricePerHour),
        status: roomData.status === 'occupied' ? 'available' : roomData.status ?? 'available'
      })
      const room = normalizeRoom(response.data)
      rooms.value.push(room)
      return { ok: true, message: 'admin.rooms.created-successfully', room }
    } catch (error) {
      return { ok: false, message: getErrorMessage(error, 'admin.rooms.validation.duplicate-number') }
    }
  }

  async function updateRoom(roomId, roomData) {
    const room = getRoomById(roomId)
    if (!room) return { ok: false, message: 'admin.rooms.validation.not-found' }

    const validation = validateRoomData(roomData, roomId)
    if (!validation.valid) return { ok: false, message: validation.message }

    try {
      const response = await roomsEndpoint.update(room.id, {
        ...room,
        number: String(roomData.number).trim(),
        floor: Number(roomData.floor),
        type: roomData.type,
        capacity: Number(roomData.capacity),
        pricePerHour: money(roomData.pricePerHour),
        status: room.status === 'occupied' ? 'available' : room.status
      })
      Object.assign(room, normalizeRoom(response.data))
      return { ok: true, message: 'admin.rooms.updated-successfully' }
    } catch (error) {
      return { ok: false, message: getErrorMessage(error, 'admin.rooms.validation.not-found') }
    }
  }

  async function deleteRoom(roomId) {
    const room = getRoomById(roomId)
    if (!room) return { ok: false, message: 'admin.rooms.validation.not-found' }

    const hasActiveStay = activeStaysWithDetails.value.some(stay => sameId(stay.roomId, roomId))
    if (hasActiveStay) return { ok: false, message: 'admin.rooms.validation.delete-active-stay' }

    const hasConfirmedReservation = reservations.value.some(reservation => sameId(reservation.roomId, roomId) && getReservationRuntimeStatus(reservation, now.value) === 'confirmed')
    if (hasConfirmedReservation) return { ok: false, message: 'admin.rooms.validation.delete-confirmed-reservation' }

    try {
      await roomsEndpoint.delete(roomId)
      rooms.value = rooms.value.filter(item => !sameId(item.id, roomId))
      return { ok: true, message: 'admin.rooms.deleted-successfully' }
    } catch (error) {
      return { ok: false, message: getErrorMessage(error, 'admin.rooms.validation.not-found') }
    }
  }

  async function updateHotel(hotelData) {
    if (!activeHotel.value) return { ok: false, message: 'admin.hotel.validation.not-found' }
    try {
      const payload = {
        name: hotelData.name ?? activeHotel.value.name,
        ruc: hotelData.ruc ?? activeHotel.value.ruc ?? '',
        address: hotelData.address ?? activeHotel.value.address ?? '',
        phone: hotelData.phone ?? activeHotel.value.phone ?? '',
        email: hotelData.email ?? activeHotel.value.email ?? '',
        plan: hotelData.plan ?? currentPlan.value,
        status: hotelData.status ?? activeHotel.value.status ?? 'active'
      }
      const response = await hotelsEndpoint.update(activeHotel.value.id, payload)
      Object.assign(activeHotel.value, response.data)
      return { ok: true, message: 'admin.hotel.updated-successfully' }
    } catch (error) {
      return { ok: false, message: getErrorMessage(error, 'admin.hotel.validation.not-found') }
    }
  }

  function createStaffUser() {
    return { ok: false, message: 'admin.staff.validation.use-iam-context' }
  }

  function getSubscriptionPayments() {
    const hotelId = activeHotel.value?.id
    return hotelId ? subscriptionPayments.value.filter(payment => sameId(payment.hotelId, hotelId)) : []
  }

  async function updateSubscription(plan) {
    if (!activeHotel.value) return { ok: false, message: 'admin.hotel.validation.not-found' }
    const normalizedPlan = String(plan ?? 'Basic')
    const amount = normalizedPlan === 'Pro' ? 49.99 : 29.99

    try {
      await updateHotel({ plan: normalizedPlan })
      let subscription = activeSubscription.value
      if (subscription) {
        const subscriptionResponse = await subscriptionsEndpoint.update(subscription.id, {
          hotelId: activeHotel.value.id,
          plan: normalizedPlan,
          status: 'active',
          monthlyAmount: amount,
          startedAt: subscription.startedAt ?? new Date().toISOString(),
          endsAt: subscription.endsAt ?? null
        })
        Object.assign(subscription, subscriptionResponse.data)

        const paymentResponse = await subscriptionPaymentsEndpoint.create({
          subscriptionId: subscription.id,
          hotelId: activeHotel.value.id,
          plan: normalizedPlan,
          amount,
          method: 'card',
          status: 'paid',
          paidAt: new Date().toISOString()
        })
        subscriptionPayments.value.unshift(paymentResponse.data)
      }
      return { ok: true, message: 'subscription.updated' }
    } catch (error) {
      return { ok: false, message: getErrorMessage(error, 'subscription.update-error') }
    }
  }

  function getStayStatusLabel(status) {
    return {
      active: 'Activa',
      endingSoon: 'Por vencer',
      overdue: 'Vencida sin checkout',
      finished: 'Finalizada'
    }[status] ?? status
  }

  function getRoomStatusLabel(status) {
    return {
      available: 'Disponible',
      occupied: 'Ocupada',
      cleaning: 'Limpieza',
      maintenance: 'Mantenimiento',
      endingSoon: 'Por vencer',
      overdue: 'Salida vencida'
    }[status] ?? status
  }

  function getReservationStatusLabel(status) {
    return {
      confirmed: 'Confirmada',
      cancelled: 'Cancelada',
      completed: 'Finalizada'
    }[status] ?? status
  }

  return {
    hotels,
    rooms: hotelRooms,
    reservations: hotelReservations,
    guests,
    guestStays: hotelGuestStays,
    consumptions,
    payments,
    invoices,
    cleaningTasks,
    notifications,
    subscriptions,
    subscriptionPayments,
    now,
    activeHotel,
    currentPlan,
    hasProPlan,
    activeGuestStays,
    activeStaysWithDetails,
    staysWithDetails,
    endingSoonStays,
    overdueStays,
    availableRooms,
    roomsWithDetails,
    reservationsWithDetails,
    activeReservations,
    dashboardStats,
    internalNotifications,
    loadFromApi,
    getRoomById,
    getReservationById,
    getStayById,
    getStayRuntimeStatus,
    getConsumptionTotal,
    getStayTotal,
    getStayConsumptions,
    searchEverywhere,
    validateReservationAvailability,
    createReservation,
    cancelReservation,
    createCheckIn,
    addConsumption,
    updateConsumption,
    deleteConsumption,
    confirmPayment,
    issueInvoiceAndFinishStay,
    updateRoomStatus,
    createRoom,
    updateRoom,
    deleteRoom,
    updateHotel,
    getSubscriptionPayments,
    updateSubscription,
    createStaffUser,
    getStayStatusLabel,
    getRoomStatusLabel,
    getReservationStatusLabel
  }
})

export default useHotelOperationsStore
