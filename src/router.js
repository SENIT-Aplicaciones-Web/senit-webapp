import { createRouter, createWebHistory } from 'vue-router'
import iamRoutes from './iam/presentation/iam-routes.js'
import frontDeskRoutes from './front-desk/presentation/front-desk.routes.js'
import adminRoutes from './front-desk/presentation/admin.routes.js'
import useIamStore from './iam/application/iam.store.js'

const pageNotFound = () =>
    import('./shared/presentation/views/page-not-found.vue')

const routes = [
    {
        path: '/',
        redirect: '/sign-in'
    },
    ...iamRoutes,
    {
        path: '/front-desk',
        name: 'front-desk',
        redirect: '/front-desk/dashboard',
        meta: { requiresAuth: true, roles: ['FRONT_DESK', 'ADMIN'] },
        children: frontDeskRoutes
    },
    {
        path: '/admin',
        name: 'admin',
        redirect: '/admin/dashboard',
        meta: { requiresAuth: true, roles: ['ADMIN'] },
        children: adminRoutes
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
    routes,
    scrollBehavior() {
        return { top: 0, left: 0 }
    }
})

router.beforeEach(to => {
    const iamStore = useIamStore()
    const baseTitle = 'Senit'
    document.title = `${baseTitle} - ${to.meta.title ?? 'App'}`

    const matchedWithAuth = to.matched.find(record => record.meta.requiresAuth)
    if (matchedWithAuth && !iamStore.isAuthenticated) {
        return { name: 'sign-in' }
    }

    const allowedRoles = matchedWithAuth?.meta.roles
    if (allowedRoles && iamStore.currentUser && !allowedRoles.includes(iamStore.currentUser.role)) {
        return iamStore.currentUser.role === 'ADMIN'
            ? { name: 'admin-dashboard' }
            : { name: 'front-desk-dashboard' }
    }

    if ((to.name === 'sign-in' || to.name === 'sign-up') && iamStore.isAuthenticated) {
        return iamStore.currentUser.role === 'ADMIN'
            ? { name: 'admin-dashboard' }
            : { name: 'front-desk-dashboard' }
    }

    return true
})

export default router
