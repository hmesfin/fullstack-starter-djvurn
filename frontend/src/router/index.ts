import { createRouter, createWebHistory } from 'vue-router'
import { hasTokens } from '@/lib/token-storage'
import MainLayout from '@/layouts/MainLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // Public routes (MainLayout)
    {
      path: '/',
      component: MainLayout,
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('@/views/main/HomeView.vue'),
        },
      ],
    },

    // Auth routes (AuthLayout - centered card layout)
    {
      path: '/',
      component: AuthLayout,
      meta: { requiresGuest: true },
      children: [
        {
          path: 'login',
          name: 'login',
          component: () => import('@/views/auth/LoginView.vue'),
        },
        {
          path: 'register',
          name: 'register',
          component: () => import('@/views/auth/RegisterView.vue'),
        },
        {
          path: 'forgot-password',
          name: 'forgot-password',
          component: () => import('@/views/auth/ForgotPasswordView.vue'),
        },
        {
          path: 'reset-password',
          name: 'reset-password',
          component: () => import('@/views/auth/ResetPasswordView.vue'),
        },
      ],
    },

    // Authenticated routes (DashboardLayout - sidebar + header)
    {
      path: '/dashboard',
      component: DashboardLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('@/views/dashboard/DashboardView.vue'),
        },
        {
          path: 'projects',
          name: 'projects',
          component: () => import('@/views/projects/ProjectListView.vue'),
        },
        {
          path: 'profile',
          name: 'profile',
          component: () => import('@/views/user/ProfileView.vue'),
        },
        {
          path: 'projects/:uuid',
          name: 'project-detail',
          component: () => import('@/views/projects/ProjectDetailView.vue'),
        },
      ],
    },
  ],
})

// Navigation guards
router.beforeEach((to, _from, next) => {
  const isAuthenticated = hasTokens()

  // Check if any matched route requires authentication
  const requiresAuth = to.matched.some((record) => record.meta['requiresAuth'])
  const requiresGuest = to.matched.some((record) => record.meta['requiresGuest'])

  if (requiresAuth && !isAuthenticated) {
    // Redirect to login if trying to access protected route without auth
    next({ name: 'login' })
  } else if (requiresGuest && isAuthenticated) {
    // Redirect to dashboard if trying to access guest route while authenticated
    next({ name: 'dashboard' })
  } else {
    next()
  }
})

export default router
