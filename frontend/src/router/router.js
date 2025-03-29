import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LogInView from '../views/LogInView.vue'
import RegisterView from '../views/RegisterView.vue'
import ProfileView from '../users/ProfileView.vue'
import { useUserStore } from '@/stores/userStore'  
import { getActivePinia } from 'pinia'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: LogInView,
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      meta: { requiresAuth: false }, //endre til true senere
    },
  ],
})

router.beforeEach((to, from, next) => {
  const pinia = getActivePinia()
  const userStore = useUserStore(pinia)

  userStore.checkAuth()

  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router
