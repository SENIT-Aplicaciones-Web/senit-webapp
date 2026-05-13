const frontDeskDashboard = () => import('./views/front-desk-dashboard.vue')

const frontDeskRoutes = [
    {
        path: 'dashboard',
        name: 'front-desk-dashboard',
        component: frontDeskDashboard,
        meta: { title: 'Front Desk Dashboard' }
    }
]

export default frontDeskRoutes