import { Home } from './views/home'
import { NavBar } from './cmps/nav-bar'
import { LoginSignup } from './views/login-signup'
import { SeedDemo } from './views/seed-demo'

export default [
    {
        path: '',
        component: <Home />,
    },
    {
        path: '/workspace/*',
        component: <section className="agenda-app"><NavBar /></section>,
    },
    {
        path: '/secret/seed-demo',
        component: <SeedDemo />,
    },
    {
        path: '/auth/*',
        component: <LoginSignup />,
    },
]