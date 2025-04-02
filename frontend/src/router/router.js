import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LogInView from '../views/LogInView.vue'
import RegisterView from '../views/RegisterView.vue'
import ProfileView from '../users/ProfileView.vue'
import { useUserStore } from '@/stores/userStore'  
import { getActivePinia } from 'pinia'
import CreateItemView from "@/views/CreateItemView.vue";
import MyItemsView from '@/users/MyItemsView.vue'
import ItemView from "@/views/ItemView.vue";
import EditItemView from "@/views/EditItemView.vue";
import MyFavoriteView from '@/users/MyFavoriteView.vue'
import MessagesView from '@/users/MessagesView.vue'
import ConverSationView from '@/users/ConversationView.vue'

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
      props: true
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
      component: ConverSationView,
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach(async(to, from, next) => {
  const pinia = getActivePinia()
  const userStore = useUserStore(pinia)

  await userStore.checkAuth()

  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router
