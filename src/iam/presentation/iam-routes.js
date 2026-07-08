const signIn = () => import('./views/sign-in.vue')
const signUp = () => import('./views/sign-up.vue')
const checkoutSuccess = () => import('./views/checkout-success.vue')

const iamRoutes = [
    {
        path: '/sign-in',
        name: 'sign-in',
        component: signIn,
        meta: { title: 'Sign In' }
    },
    {
        path: '/sign-up',
        name: 'sign-up',
        component: signUp,
        meta: { title: 'Sign Up' }
    },
    {
        path: '/checkout/success',
        name: 'checkout-success',
        component: checkoutSuccess,
        meta: { title: 'Checkout Success' }
    }
]

export default iamRoutes
