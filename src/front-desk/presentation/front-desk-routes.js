const frontDeskLayout = () => import('./layouts/front-desk-layout.vue')
const frontDeskDashboard = () => import('./views/front-desk-dashboard.vue')
const frontDeskRooms = () => import('./views/front-desk-rooms.vue')
const frontDeskStays = () => import('./views/front-desk-stays.vue')
const frontDeskCheckIn = () => import('./views/front-desk-check-in.vue')
const frontDeskReservations = () => import('./views/front-desk-reservations.vue')
const frontDeskAlerts = () => import('./views/front-desk-alerts.vue')
const frontDeskSettings = () => import('./views/front-desk-settings.vue')
const stayDetails = () => import('./views/check-in-flow/stay-details.vue')
const stayCheckout = () => import('./views/check-in-flow/stay-checkout.vue')
const frontDeskReservationForm = () => import('./views/front-desk-reservation-form.vue')

const frontDeskRoutes = [
    {
        path: '',
        component: frontDeskLayout,
        children: [
            {
                path: 'dashboard',
                name: 'front-desk-dashboard',
                component: frontDeskDashboard,
                meta: { title: 'Panel de Recepción' }
            },
            {
                path: 'rooms',
                name: 'front-desk-rooms',
                component: frontDeskRooms,
                meta: { title: 'Habitaciones' }
            },
            {
                path: 'stays',
                name: 'front-desk-stays',
                component: frontDeskStays,
                meta: { title: 'Estadías' }
            },
            {
                path: 'check-in',
                name: 'front-desk-check-in',
                component: frontDeskCheckIn,
                meta: { title: 'Check-in' }
            },
            {
                path: 'reservations',
                name: 'front-desk-reservations',
                component: frontDeskReservations,
                meta: { title: 'Reservas' }
            },
            {
                path: 'reservations/new',
                name: 'front-desk-reservation-new',
                component: frontDeskReservationForm,
                meta: { title: 'Nueva Reserva' }
            },
            {
                path: 'alerts',
                name: 'front-desk-alerts',
                component: frontDeskAlerts,
                meta: { title: 'Alertas' }
            },
            {
                path: 'settings',
                name: 'front-desk-settings',
                component: frontDeskSettings,
                meta: { title: 'Configuración' }
            },
            {
                path: 'stays/:id/details',
                name: 'front-desk-stay-details',
                component: stayDetails,
                meta: { title: 'Detalles de Estadía' }
            },
            {
                path: 'stays/:id/checkout',
                name: 'front-desk-stay-checkout',
                component: stayCheckout,
                meta: { title: 'Check-out' }
            }
        ]
    }
]

export default frontDeskRoutes
