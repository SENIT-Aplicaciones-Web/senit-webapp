const adminLayout = () => import('./layouts/admin-layout.vue')
const adminDashboard = () => import('./views/admin/admin-dashboard.vue')
const adminHotel = () => import('./views/admin/admin-hotel.vue')
const adminRooms = () => import('../../room/presentation/views/admin/admin-rooms.vue')
const adminStaff = () => import('../../iam/presentation/views/admin/admin-staff.vue')
const reservations = () => import('../../reservation/presentation/views/front-desk-reservations.vue')
const stays = () => import('../../guest-stay/presentation/views/front-desk-stays.vue')
const alerts = () => import('./views/front-desk-alerts.vue')
const settings = () => import('./views/front-desk-settings.vue')
const subscription = () => import('../../subscription-payment/presentation/views/subscription-management.vue')
const stayDetails = () => import('../../guest-stay/presentation/views/stay-details.vue')
const stayCheckout = () => import('../../payment/presentation/views/stay-checkout.vue')
const reservationForm = () => import('../../reservation/presentation/views/front-desk-reservation-form.vue')
const reservationDetails = () => import('../../reservation/presentation/views/reservation-details.vue')

const adminRoutes = [
    {
        path: '',
        component: adminLayout,
        children: [
            { path: 'dashboard', name: 'admin-dashboard', component: adminDashboard, meta: { title: 'Panel de Administración' } },
            { path: 'hotel', name: 'admin-hotel', component: adminHotel, meta: { title: 'Hotel' } },
            { path: 'rooms', name: 'admin-rooms', component: adminRooms, meta: { title: 'Habitaciones' } },
            { path: 'reservations', name: 'admin-reservations', component: reservations, meta: { title: 'Reservas' } },
            { path: 'reservations/new', name: 'admin-reservation-new', component: reservationForm, meta: { title: 'Nueva Reserva' } },
            { path: 'reservations/:id', name: 'admin-reservation-details', component: reservationDetails, meta: { title: 'Detalles de Reserva' } },
            { path: 'stays', name: 'admin-stays', component: stays, meta: { title: 'Estadías' } },
            { path: 'stays/:id/details', name: 'admin-stay-details', component: stayDetails, meta: { title: 'Detalles de Estadía' } },
            { path: 'stays/:id/checkout', name: 'admin-stay-checkout', component: stayCheckout, meta: { title: 'Check-out' } },
            { path: 'alerts', name: 'admin-alerts', component: alerts, meta: { title: 'Alertas' } },
            { path: 'subscription', name: 'admin-subscription', component: subscription, meta: { title: 'Suscripción' } },
            { path: 'staff', name: 'admin-staff', component: adminStaff, meta: { title: 'Personal' } },
            { path: 'settings', name: 'admin-settings', component: settings, meta: { title: 'Configuración' } }
        ]
    }
]

export default adminRoutes
