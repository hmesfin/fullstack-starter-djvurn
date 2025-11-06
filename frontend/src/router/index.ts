import { createRouter, createWebHistory } from 'vue-router'
import { hasTokens } from '@/lib/token-storage'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/RegisterView.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

// Navigation guards
router.beforeEach((to, _from, next) => {
  const isAuthenticated = hasTokens()

  if (to.meta['requiresAuth'] && !isAuthenticated) {
    // Redirect to login if trying to access protected route without auth
    next({ name: 'login' })
  } else if (to.meta['requiresGuest'] && isAuthenticated) {
    // Redirect to dashboard if trying to access guest route while authenticated
    next({ name: 'dashboard' })
  } else {
    next()
  }
})

export default router
