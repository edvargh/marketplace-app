import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LogInView from '../views/LogInView.vue'
import RegisterView from '../views/RegisterView.vue'
import ProfileView from '@/views/users/ProfileView.vue'
import { useUserStore } from '@/stores/userStore'  
import { getActivePinia } from 'pinia'
import CreateItemView from "@/views/items/CreateItemView.vue";
import MyItemsView from '@/views/users/MyItemsView.vue'
import ItemView from "@/views/items/ItemView.vue";
import EditItemView from "@/views/items/EditItemView.vue";
import MyFavoriteView from '@/views/users/MyFavoriteView.vue'
import FrontPageView from "@/views/FrontPageView.vue";
import MessagesView from '@/views/users/MessagesView.vue'
import ConversationView from '@/views/users/ConversationView.vue'
import CategoriesAdminView from "@/views/CategoriesAdminView.vue";
import SearchResultView from '@/views/SearchResultView.vue'
import UserPaymentComplete from '@/views/users/UserPaymentComplete.vue'
import UserPaymentFailView from '@/views/users/UserPaymentFailView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'frontpage',
      component: FrontPageView,
      meta: { hideNavbar: true }
    },
    {
      path: '/home',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      name: 'login',
      component: LogInView,
      meta: { hideNavbar: true }
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: { hideNavbar: true }
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      meta: { requiresAuth: true }, 
    },
    {
      path: '/messages/conversations',
      name: 'messages',
      component: MessagesView,
      meta: { requiresAuth: true },
    },
    {
      path: '/create',
      name: 'create',
      component: CreateItemView,
      meta: { requiresAuth: true },
    },
    {
      path: '/my-items',
      name: 'my-items',
      component: MyItemsView,
      meta: { requiresAuth: true },
    },
    {
      path: '/favorites',
      name: 'favorites',
      component: MyFavoriteView,
      meta: { requiresAuth: true },
    },
    {
      path: '/item/:id',
      name: 'ItemView',
      component: ItemView,
      props: true,
      meta: { requiresAuth: true },
    },
    {
      path: '/edit-item/:id',
      name: 'EditItemView',
      component: EditItemView,
      props: true,
      meta: { requiresAuth: true }
    },
    {
      path: '/messages/conversation',
      name: 'ConversationView',
      component: ConversationView,
      meta: { requiresAuth: true },
    },
    {
      path: '/categories',
      name: 'CategoriesAdminView',
      component: CategoriesAdminView,
      meta: { requiresAuth: true, role: 'ADMIN' }
    },
    {
      path: '/items',
      name: 'items',
      component: SearchResultView,
      meta: { requiresAuth: true },
    },
    { 
      path: '/payment-complete',
      name: 'paymentComplete',
      component: UserPaymentComplete,
      meta : { requiresAuth: true, hideNavbar: true }
    },
    {
      path: '/payment-failed',
      name: 'paymentFailed',
      component: UserPaymentFailView,
      meta : { requiresAuth: true, hideNavbar: true }
    },
  ],
})

router.beforeEach(async (to, from, next) => {
  const pinia = getActivePinia()
  const userStore = useUserStore(pinia)

  await userStore.checkAuth()
  const userRole = userStore.user?.role

  if (userStore.isAuthenticated) {
    // Redirect to HomePage if trying to access login/register/frontpage
    if (to.name === 'login' || to.name === 'register' || to.name === 'frontpage') {
      next({ name: 'home' })
    } else if (to.meta.role && to.meta.role !== userRole) {
      // User is logged in, but does not have the required role
      next({ name: 'home' })
    } else {
      next()
    }

  } else {
    if (to.meta.requiresAuth) {
      // Redirect to login page if page requires authentication
      next('/login')
    } else {
      next()
    }
  }
})

export default router
