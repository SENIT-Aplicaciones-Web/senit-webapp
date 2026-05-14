import { createRouter, createWebHashHistory } from 'vue-router'
import iamRoutes from './iam/presentation/iam-routes.js'
import frontDeskRoutes from './front-desk/presentation/front-desk-routes.js'

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
        path: '/front-desk',
        name: 'front-desk',
        children: frontDeskRoutes
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'page-not-found',
        component: pageNotFound,
        meta: { title: 'Page Not Found' }
    }
]

const router = createRouter({
    history: createWebHashHistory(import.meta.env.BASE_URL),
    routes
})

router.beforeEach((to, from, next) => {
    const baseTitle = 'Senit'
    document.title = `${baseTitle} - ${to.meta.title ?? 'App'}`
    next()
})

export default router