const frontDeskLayout = () => import('./layouts/front-desk-layout.vue')
const frontDeskDashboard = () => import('./views/front-desk-dashboard.vue')
const frontDeskRooms = () => import('./views/front-desk-rooms.vue')
const frontDeskStays = () => import('./views/front-desk-stays.vue')
const frontDeskCheckIn = () => import('./views/front-desk-check-in.vue')
const frontDeskReservations = () => import('./views/front-desk-reservations.vue')
const frontDeskAlerts = () => import('./views/front-desk-alerts.vue')
const frontDeskSettings = () => import('./views/front-desk-settings.vue')

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
            }
        ]
    }
]

export default frontDeskRoutes