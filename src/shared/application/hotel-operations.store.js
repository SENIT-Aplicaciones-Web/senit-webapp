import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { BaseApi } from '../infrastructure/base-api.js'
import { BaseEndpoint } from '../infrastructure/base-endpoint.js'
import { addHours, formatDateTime, getRemainingMilliseconds, isSameDay } from '../domain/services/date-format.service.js'
import useIamStore from '../../iam/application/iam.store.js'

function nextId(items) {
  const numericIds = items.map(item => Number(item.id)).filter(Number.isFinite)
  return numericIds.length ? Math.max(...numericIds) + 1 : 1
}

function normalize(value) {
  return String(value ?? '').trim().toLowerCase()
}

function money(value) {
  return Number(Number(value || 0).toFixed(2))
}

function sameId(firstValue, secondValue) {
  return String(firstValue ?? '') === String(secondValue ?? '')
}


function quietly(request) {
  Promise.resolve(request).catch(error => {
    console.warn('Fake API synchronization failed.', error)
  })
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
  return Math.ceil((end - start) / (60 * 60 * 1000))
}

function getStayRuntimeStatus(stay, now = new Date()) {
  if (!stay) return 'unknown'
  if (stay.status === 'finished') return 'finished'

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
  const hotelsEndpoint = new BaseEndpoint(api, '/hotels')
  const roomsEndpoint = new BaseEndpoint(api, '/rooms')
  const reservationsEndpoint = new BaseEndpoint(api, '/reservations')
  const guestsEndpoint = new BaseEndpoint(api, '/guests')
  const guestStaysEndpoint = new BaseEndpoint(api, '/guest-stays')
  const consumptionsEndpoint = new BaseEndpoint(api, '/consumptions')
  const paymentsEndpoint = new BaseEndpoint(api, '/payments')
  const invoicesEndpoint = new BaseEndpoint(api, '/invoices')
  const cleaningTasksEndpoint = new BaseEndpoint(api, '/cleaning-tasks')
  const notificationsEndpoint = new BaseEndpoint(api, '/notifications')
  const subscriptionsEndpoint = new BaseEndpoint(api, '/subscriptions')
  const subscriptionPaymentsEndpoint = new BaseEndpoint(api, '/subscription-payments')

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

  const currentPlan = computed(() => activeHotel.value?.plan ?? 'Basic')
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

  const activeGuestStays = computed(() =>
    hotelGuestStays.value.filter(stay => stay.status !== 'finished')
  )

  const staysWithDetails = computed(() =>
    hotelGuestStays.value.map(stay => decorateStay(stay))
  )

  const activeStaysWithDetails = computed(() =>
    staysWithDetails.value.filter(stay => stay.status !== 'finished')
  )

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
    const checkInsToday = hotelGuestStays.value.filter(stay => isSameDay(stay.checkInAt, now.value)).length
    const checkOutsToday = hotelGuestStays.value.filter(stay => stay.checkedOutAt && isSameDay(stay.checkedOutAt, now.value)).length
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
        read: false
      })),
      ...endingSoonStays.value.map(stay => ({
        id: `ending-${stay.id}`,
        type: 'warning',
        titleKey: 'front-desk.dashboard.ending-soon-title',
        titleParams: { room: stay.room?.number ?? '-' },
        messageKey: 'front-desk.dashboard.ending-soon-message',
        messageParams: { guest: stay.guest.fullName },
        createdAt: stay.checkOutLimitAt,
        read: false
      }))
    ]
    return [...automatic, ...notifications.value]
  })

  async function loadFromApi() {
    try {
      const responses = await Promise.all([
        hotelsEndpoint.getAll(),
        roomsEndpoint.getAll(),
        reservationsEndpoint.getAll(),
        guestsEndpoint.getAll(),
        guestStaysEndpoint.getAll(),
        consumptionsEndpoint.getAll(),
        paymentsEndpoint.getAll(),
        invoicesEndpoint.getAll(),
        cleaningTasksEndpoint.getAll(),
        notificationsEndpoint.getAll(),
        subscriptionsEndpoint.getAll().catch(() => ({ data: [] })),
        subscriptionPaymentsEndpoint.getAll().catch(() => ({ data: [] }))
      ])
      hotels.value = responses[0].data ?? []
      rooms.value = (responses[1].data ?? []).map(room => ({ ...room, status: room.status === 'blocked' ? 'maintenance' : room.status }))
      reservations.value = responses[2].data ?? []
      guests.value = responses[3].data ?? []
      guestStays.value = responses[4].data ?? []
      consumptions.value = responses[5].data ?? []
      payments.value = responses[6].data ?? []
      invoices.value = responses[7].data ?? []
      cleaningTasks.value = responses[8].data ?? []
      notifications.value = responses[9].data ?? []
      subscriptions.value = responses[10].data ?? []
      subscriptionPayments.value = responses[11].data ?? []
    } catch (error) {
      console.warn('Fake API is not available. Start json-server with: npx json-server --watch server/db.json --port 3000', error)
    }
  }

  function getReservationById(reservationId) {
    if (!reservationId) return null
    return reservations.value.find(reservation => sameId(reservation.id, reservationId)) ?? null
  }

  function getRoomById(roomId) {
    return rooms.value.find(room => sameId(room.id, roomId)) ?? null
  }

  function getStayById(stayId) {
    const stay = guestStays.value.find(item => sameId(item.id, stayId))
    return stay ? decorateStay(stay) : null
  }

  function getConsumptionTotal(stayId) {
    return consumptions.value
      .filter(consumption => sameId(consumption.stayId, stayId))
      .reduce((sum, consumption) => sum + Number(consumption.quantity) * Number(consumption.unitPrice), 0)
  }

  function getStayTotal(stay) {
    const reservation = getReservationById(stay.reservationId)
    const prepaidAmount = money(reservation?.prepaidAmount ?? stay.prepaidAmount ?? 0)
    const accommodationDue = Math.max(Number(stay.initialAmount) - prepaidAmount, 0)
    return money(accommodationDue + getConsumptionTotal(stay.id))
  }

  function getStayConsumptions(stayId) {
    return consumptions.value.filter(consumption => sameId(consumption.stayId, stayId))
  }

  function decorateStay(stay) {
    const room = getRoomById(stay.roomId)
    const status = getStayRuntimeStatus(stay, now.value)
    const stayConsumptions = getStayConsumptions(stay.id)
    const reservation = getReservationById(stay.reservationId)
    const prepaidAmount = money(reservation?.prepaidAmount ?? stay.prepaidAmount ?? 0)
    const accommodationDue = money(Math.max(Number(stay.initialAmount) - prepaidAmount, 0))
    const total = getStayTotal(stay)
    return {
      ...stay,
      room,
      roomNumber: room?.number ?? '- ',
      status,
      statusLabel: getStayStatusLabel(status),
      paymentStatusLabel: stay.paymentStatus === 'paid' ? 'Pagado' : 'Por pagar',
      consumptions: stayConsumptions,
      consumptionsTotal: money(getConsumptionTotal(stay.id)),
      reservation,
      prepaidAmount,
      accommodationDue,
      total,
      formattedCheckIn: formatDateTime(stay.checkInAt),
      formattedCheckOut: formatDateTime(stay.checkOutLimitAt),
      checkedOutLabel: stay.checkedOutAt ? formatDateTime(stay.checkedOutAt) : '-'
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

    const hasReservationOverlap = reservations.value.some(reservation => {
      if (reservation.status !== 'confirmed') return false
      if (sameId(reservation.id, reservationId)) return false
      if (!sameId(reservation.roomId, roomId)) return false
      return start < new Date(reservation.endAt).getTime() && end > new Date(reservation.startAt).getTime()
    })

    const hasStayOverlap = guestStays.value.some(stay => {
      if (stay.status === 'finished') return false
      if (!sameId(stay.roomId, roomId)) return false
      return start < new Date(stay.checkOutLimitAt).getTime() && end > new Date(stay.checkInAt).getTime()
    })

    if (hasReservationOverlap || hasStayOverlap) {
      return { valid: false, message: 'front-desk.validation.overlapping-booking' }
    }

    return { valid: true, message: '' }
  }

  function createReservation(reservationData) {
    const validation = validateReservationAvailability(reservationData)
    if (!validation.valid) return { ok: false, message: validation.message }

    const room = getRoomById(reservationData.roomId)
    const hours = getReservationHours(reservationData.startAt, reservationData.endAt)
    const reservationAmount = money(hours * Number(room?.pricePerHour ?? 0))

    if (reservationAmount <= 0) return { ok: false, message: 'front-desk.validation.reservation-payment-error' }

    const reservation = {
      id: nextId(reservations.value),
      hotelId: activeHotel.value?.id ?? 1,
      roomId: reservationData.roomId,
      guestName: reservationData.guestName.trim(),
      dni: reservationData.dni.trim(),
      phone: reservationData.phone.trim(),
      email: reservationData.email.trim(),
      guestsQuantity: Number(reservationData.guestsQuantity ?? 1),
      startAt: reservationData.startAt,
      endAt: reservationData.endAt,
      hours,
      reservationAmount,
      prepaidAmount: reservationAmount,
      paymentMethod: reservationData.paymentMethod ?? 'cash',
      paymentStatus: 'paid',
      paidAt: new Date().toISOString(),
      status: 'confirmed'
    }

    reservations.value.push(reservation)
    quietly(reservationsEndpoint.create(reservation))
    const reservationPayment = {
      id: nextId(payments.value),
      hotelId: activeHotel.value?.id ?? 1,
      reservationId: reservation.id,
      stayId: null,
      amount: reservationAmount,
      method: reservation.paymentMethod,
      status: 'completed',
      paidAt: reservation.paidAt
    }
    payments.value.push(reservationPayment)
    quietly(paymentsEndpoint.create(reservationPayment))
    const reservationNotification = {
      id: nextId(notifications.value),
      title: 'Nueva reserva registrada',
      message: `${reservation.guestName} fue registrado para la habitación ${getRoomById(reservation.roomId)?.number}.`,
      type: 'success',
      createdAt: new Date().toISOString(),
      read: false
    }
    notifications.value.unshift(reservationNotification)
    quietly(notificationsEndpoint.create(reservationNotification))

    return { ok: true, message: 'front-desk.reservations.created-successfully', reservation }
  }

  function cancelReservation(reservationId) {
    const reservation = reservations.value.find(item => sameId(item.id, reservationId))
    if (!reservation) return { ok: false, message: 'front-desk.reservations.not-found' }
    if (reservation.status === 'cancelled') return { ok: false, message: 'front-desk.reservations.already-cancelled' }

    reservation.status = 'cancelled'
    quietly(reservationsEndpoint.update(reservation.id, reservation))
    const cancelNotification = {
      id: nextId(notifications.value),
      title: 'Reserva cancelada',
      message: `Se canceló la reserva de ${reservation.guestName}.`,
      type: 'warning',
      createdAt: new Date().toISOString(),
      read: false
    }
    notifications.value.unshift(cancelNotification)
    quietly(notificationsEndpoint.create(cancelNotification))
    return { ok: true, message: 'front-desk.reservations.cancelled-successfully' }
  }

  function createCheckIn(checkInData) {
    const room = getRoomById(checkInData.roomId)
    if (!room) return { ok: false, message: 'front-desk.validation.valid-room' }
    if (room.status !== 'available') return { ok: false, message: 'front-desk.validation.room-not-available' }

    const checkInAt = new Date()
    const hours = Number(checkInData.hours)
    const checkOutLimitAt = addHours(checkInAt, hours)
    const guest = {
      id: nextId(guests.value),
      fullName: checkInData.fullName.trim(),
      dni: checkInData.dni.trim(),
      phone: checkInData.phone.trim(),
      email: checkInData.email.trim()
    }
    guests.value.push(guest)
    quietly(guestsEndpoint.create(guest))

    const stay = {
      id: nextId(guestStays.value),
      hotelId: activeHotel.value?.id ?? 1,
      roomId: checkInData.roomId,
      guestId: guest.id,
      guest: {
        fullName: guest.fullName,
        dni: guest.dni,
        phone: guest.phone,
        email: guest.email
      },
      checkInAt: checkInAt.toISOString(),
      checkOutLimitAt: checkOutLimitAt.toISOString(),
      checkedOutAt: null,
      hours,
      initialAmount: money(hours * Number(room.pricePerHour)),
      paymentStatus: 'pending',
      paymentMethod: checkInData.paymentMethod ?? 'cash',
      status: 'active'
    }

    guestStays.value.push(stay)
    quietly(guestStaysEndpoint.create(stay))
    room.status = 'occupied'
    quietly(roomsEndpoint.update(room.id, room))
    const checkInNotification = {
      id: nextId(notifications.value),
      title: 'Check-in registrado',
      message: `${guest.fullName} ingresó a la habitación ${room.number}.`,
      type: 'success',
      createdAt: new Date().toISOString(),
      read: false
    }
    notifications.value.unshift(checkInNotification)
    quietly(notificationsEndpoint.create(checkInNotification))

    return { ok: true, message: 'front-desk.check-in.created-title', stay: decorateStay(stay) }
  }

  function addConsumption(stayId, consumptionData) {
    const stay = guestStays.value.find(item => sameId(item.id, stayId))
    if (!stay || stay.status === 'finished') return { ok: false, message: 'front-desk.checkout.validation.open-stay-consumption' }

    const description = consumptionData.description?.trim()
    const quantity = Number(consumptionData.quantity)
    const unitPrice = Number(consumptionData.unitPrice)
    if (!description) return { ok: false, message: 'front-desk.checkout.validation.consumption-name' }
    if (!quantity || quantity <= 0) return { ok: false, message: 'front-desk.checkout.validation.valid-quantity' }
    if (!unitPrice || unitPrice <= 0) return { ok: false, message: 'front-desk.checkout.validation.valid-price' }

    const consumption = {
      id: nextId(consumptions.value),
      stayId: stayId,
      description,
      quantity,
      unitPrice: money(unitPrice),
      createdAt: new Date().toISOString()
    }
    consumptions.value.push(consumption)
    quietly(consumptionsEndpoint.create(consumption))

    if (stay.paymentStatus === 'paid') {
      stay.paymentStatus = 'pending'
      quietly(guestStaysEndpoint.update(stay.id, stay))
    }

    return { ok: true, message: 'front-desk.checkout.consumption-added', consumption }
  }


  function updateConsumption(consumptionId, consumptionData) {
    const consumption = consumptions.value.find(item => sameId(item.id, consumptionId))
    if (!consumption) return { ok: false, message: 'front-desk.checkout.validation.consumption-not-found' }

    const stay = guestStays.value.find(item => sameId(item.id, consumption.stayId))
    if (!stay || stay.status === 'finished') return { ok: false, message: 'front-desk.checkout.validation.finished-consumption-edit' }

    const description = consumptionData.description?.trim()
    const quantity = Number(consumptionData.quantity)
    const unitPrice = Number(consumptionData.unitPrice)
    if (!description) return { ok: false, message: 'front-desk.checkout.validation.consumption-name' }
    if (!quantity || quantity <= 0) return { ok: false, message: 'front-desk.checkout.validation.valid-quantity' }
    if (!unitPrice || unitPrice <= 0) return { ok: false, message: 'front-desk.checkout.validation.valid-price' }

    Object.assign(consumption, { description, quantity, unitPrice: money(unitPrice) })
    quietly(consumptionsEndpoint.update(consumption.id, consumption))
    if (stay.paymentStatus === 'paid') {
      stay.paymentStatus = 'pending'
      quietly(guestStaysEndpoint.update(stay.id, stay))
    }
    return { ok: true, message: 'front-desk.checkout.consumption-updated', consumption }
  }

  function deleteConsumption(consumptionId) {
    const consumption = consumptions.value.find(item => sameId(item.id, consumptionId))
    if (!consumption) return { ok: false, message: 'front-desk.checkout.validation.consumption-not-found' }

    const stay = guestStays.value.find(item => sameId(item.id, consumption.stayId))
    if (!stay || stay.status === 'finished') return { ok: false, message: 'front-desk.checkout.validation.finished-consumption-delete' }

    consumptions.value = consumptions.value.filter(item => !sameId(item.id, consumptionId))
    quietly(consumptionsEndpoint.delete(consumptionId))
    if (stay.paymentStatus === 'paid') {
      stay.paymentStatus = 'pending'
      quietly(guestStaysEndpoint.update(stay.id, stay))
    }
    return { ok: true, message: 'front-desk.checkout.consumption-deleted' }
  }

  function confirmPayment(stayId, method = 'cash') {
    const stay = guestStays.value.find(item => sameId(item.id, stayId))
    if (!stay) return { ok: false, message: 'front-desk.checkout.not-found' }
    if (stay.status === 'finished') return { ok: false, message: 'front-desk.checkout.already-finished' }

    stay.paymentStatus = 'paid'
    stay.paymentMethod = method

    const existingPayment = payments.value.find(payment => sameId(payment.stayId, stayId) && payment.status === 'completed')
    const payment = {
      id: existingPayment?.id ?? nextId(payments.value),
      hotelId: activeHotel.value?.id ?? 1,
      stayId: stayId,
      amount: getStayTotal(stay),
      method,
      status: 'completed',
      paidAt: new Date().toISOString()
    }

    quietly(guestStaysEndpoint.update(stay.id, stay))

    if (existingPayment) {
      Object.assign(existingPayment, payment)
      quietly(paymentsEndpoint.update(existingPayment.id, existingPayment))
    } else {
      payments.value.push(payment)
      quietly(paymentsEndpoint.create(payment))
    }

    return { ok: true, message: 'front-desk.checkout.payment-confirmed', payment }
  }

  function issueInvoiceAndFinishStay(stayId) {
    const stay = guestStays.value.find(item => sameId(item.id, stayId))
    if (!stay) return { ok: false, message: 'front-desk.checkout.not-found' }
    if (stay.paymentStatus !== 'paid') return { ok: false, message: 'front-desk.checkout.confirm-before-receipt' }

    const decoratedStay = decorateStay(stay)
    const existingInvoice = invoices.value.find(invoice => sameId(invoice.stayId, stayId))
    const invoice = existingInvoice ?? {
      id: nextId(invoices.value),
      stayId: stayId,
      number: `B001-${String(nextId(invoices.value)).padStart(6, '0')}`,
      issuedAt: new Date().toISOString(),
      amount: decoratedStay.total,
      status: 'issued'
    }

    if (!existingInvoice) {
      invoices.value.push(invoice)
      quietly(invoicesEndpoint.create(invoice))
    }

    stay.status = 'finished'
    stay.checkedOutAt = new Date().toISOString()

    const room = getRoomById(stay.roomId)
    quietly(guestStaysEndpoint.update(stay.id, stay))

    if (room) {
      room.status = 'cleaning'
      quietly(roomsEndpoint.update(room.id, room))
    }

    const cleaningTask = {
      id: nextId(cleaningTasks.value),
      roomId: stay.roomId,
      title: `Limpieza post check-out Hab. ${room?.number ?? stay.roomId}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
      completedAt: null
    }
    cleaningTasks.value.push(cleaningTask)
    quietly(cleaningTasksEndpoint.create(cleaningTask))

    const checkoutNotification = {
      id: nextId(notifications.value),
      title: 'Checkout finalizado',
      message: `La habitación ${room?.number ?? stay.roomId} pasó a limpieza.`,
      type: 'success',
      createdAt: new Date().toISOString(),
      read: false
    }
    notifications.value.unshift(checkoutNotification)
    quietly(notificationsEndpoint.create(checkoutNotification))

    return { ok: true, message: 'front-desk.checkout.receipt-finished', invoice, stay: decorateStay(stay) }
  }

  function updateRoomStatus(roomId, status) {
    const room = getRoomById(roomId)
    if (!room) return { ok: false, message: 'admin.rooms.validation.not-found' }

    const hasActiveStay = activeStaysWithDetails.value.some(stay => sameId(stay.roomId, roomId))
    if (hasActiveStay) return { ok: false, message: 'admin.rooms.validation.active-stay-status' }
    if (status === 'occupied') return { ok: false, message: 'admin.rooms.validation.occupied-only-checkin' }

    room.status = status
    quietly(roomsEndpoint.update(room.id, room))

    const openTask = cleaningTasks.value.find(task => sameId(task.roomId, roomId) && task.status === 'pending')
    if (openTask && (status === 'available' || status === 'maintenance')) {
      openTask.status = status === 'available' ? 'completed' : 'maintenance'
      openTask.completedAt = new Date().toISOString()
      quietly(cleaningTasksEndpoint.update(openTask.id, openTask))
    }

    return { ok: true, message: 'admin.rooms.status-updated' }
  }

  function validateRoomData(roomData, roomId = null) {
    const roomNumber = String(roomData.number ?? '').trim()
    if (!roomNumber) return { valid: false, message: 'admin.rooms.validation.number-required' }
    if (rooms.value.some(room => room.number === roomNumber && !sameId(room.id, roomId))) {
      return { valid: false, message: 'admin.rooms.validation.duplicate-number' }
    }
    if (!Number(roomData.floor) || Number(roomData.floor) <= 0) return { valid: false, message: 'admin.rooms.validation.valid-floor' }
    if (!Number(roomData.capacity) || Number(roomData.capacity) <= 0) return { valid: false, message: 'admin.rooms.validation.valid-capacity' }
    if (!Number(roomData.pricePerHour) || Number(roomData.pricePerHour) <= 0) return { valid: false, message: 'admin.rooms.validation.valid-price' }
    return { valid: true, message: '' }
  }

  function createRoom(roomData) {
    const validation = validateRoomData(roomData)
    if (!validation.valid) return { ok: false, message: validation.message }

    const room = {
      id: nextId(rooms.value),
      hotelId: activeHotel.value?.id ?? 1,
      number: String(roomData.number).trim(),
      floor: Number(roomData.floor),
      type: roomData.type,
      capacity: Number(roomData.capacity),
      pricePerHour: money(roomData.pricePerHour),
      status: roomData.status === 'occupied' ? 'available' : roomData.status ?? 'available'
    }
    rooms.value.push(room)
    quietly(roomsEndpoint.create(room))
    return { ok: true, message: 'admin.rooms.created-successfully', room }
  }

  function updateRoom(roomId, roomData) {
    const room = getRoomById(roomId)
    if (!room) return { ok: false, message: 'admin.rooms.validation.not-found' }

    const validation = validateRoomData(roomData, roomId)
    if (!validation.valid) return { ok: false, message: validation.message }

    Object.assign(room, {
      number: String(roomData.number).trim(),
      floor: Number(roomData.floor),
      type: roomData.type,
      capacity: Number(roomData.capacity),
      pricePerHour: money(roomData.pricePerHour)
    })

    quietly(roomsEndpoint.update(room.id, room))
    return { ok: true, message: 'admin.rooms.updated-successfully' }
  }

  function deleteRoom(roomId) {
    const room = getRoomById(roomId)
    if (!room) return { ok: false, message: 'admin.rooms.validation.not-found' }

    const hasActiveStay = activeStaysWithDetails.value.some(stay => sameId(stay.roomId, roomId))
    if (hasActiveStay) return { ok: false, message: 'admin.rooms.validation.delete-active-stay' }

    const hasConfirmedReservation = reservations.value.some(reservation => sameId(reservation.roomId, roomId) && getReservationRuntimeStatus(reservation, now.value) === 'confirmed')
    if (hasConfirmedReservation) return { ok: false, message: 'admin.rooms.validation.delete-confirmed-reservation' }

    rooms.value = rooms.value.filter(item => !sameId(item.id, roomId))
    quietly(roomsEndpoint.delete(roomId))
    return { ok: true, message: 'admin.rooms.deleted-successfully' }
  }

  function updateHotel(hotelData) {
    if (!activeHotel.value) return { ok: false, message: 'admin.hotel.validation.not-found' }
    Object.assign(activeHotel.value, hotelData)
    quietly(hotelsEndpoint.update(activeHotel.value.id, activeHotel.value))
    return { ok: true, message: 'admin.hotel.updated-successfully' }
  }

  function createStaffUser() {
    return { ok: false, message: 'admin.staff.validation.use-iam-context' }
  }

  function getSubscriptionPayments() {
    const hotelId = activeHotel.value?.id
    return hotelId ? subscriptionPayments.value.filter(payment => sameId(payment.hotelId, hotelId)) : []
  }

  function updateSubscription(plan) {
    if (!activeHotel.value) return { ok: false, message: 'admin.hotel.validation.not-found' }
    const normalizedPlan = String(plan ?? 'Basic')
    activeHotel.value.plan = normalizedPlan
    quietly(hotelsEndpoint.update(activeHotel.value.id, activeHotel.value))
    const payment = {
      id: nextId(subscriptionPayments.value),
      hotelId: activeHotel.value.id,
      plan: normalizedPlan,
      amount: normalizedPlan === 'Pro' ? 49.99 : 29.99,
      status: 'completed',
      paidAt: new Date().toISOString()
    }
    subscriptionPayments.value.unshift(payment)
    quietly(subscriptionPaymentsEndpoint.create(payment))
    return { ok: true, message: 'subscription.updated' }
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
