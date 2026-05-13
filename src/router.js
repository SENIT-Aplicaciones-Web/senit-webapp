import { createRouter, createWebHistory } from 'vue-router'
import iamRoutes from './iam/presentation/iam-routes.js'

const dashboardPlaceholder = () =>
    import('./shared/presentation/views/dashboard-placeholder.vue')

const pageNotFound = () =>
    import('./shared/presentation/views/page-not-found.vue')

const routes = [
    {
        path: '/',
        redirect: '/iam/sign-in'
    },
    {
        path: '/iam',
        name: 'iam',
        children: iamRoutes
    },
    {
        path: '/app/dashboard',
        name: 'app-dashboard',
        component: dashboardPlaceholder,
        meta: { title: 'Dashboard' }
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'page-not-found',
        component: pageNotFound,
        meta: { title: 'Page Not Found' }
    }
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
})

router.beforeEach((to, from, next) => {
    const baseTitle = 'Senit'
    document.title = `${baseTitle} - ${to.meta.title ?? 'App'}`
    next()
})

export default router