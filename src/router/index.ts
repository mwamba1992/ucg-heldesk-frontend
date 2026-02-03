import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { UserRole } from '@/types';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/LoginView.vue'),
      meta: { guest: true },
    },
    {
      path: '/',
      component: () => import('@/layouts/MainLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          redirect: '/dashboard',
        },
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('@/views/dashboard/DashboardView.vue'),
        },
        // Tickets
        {
          path: 'tickets',
          name: 'tickets',
          component: () => import('@/views/tickets/TicketsView.vue'),
        },
        {
          path: 'tickets/new',
          name: 'create-ticket',
          component: () => import('@/views/tickets/CreateTicketView.vue'),
        },
        {
          path: 'tickets/:id',
          name: 'ticket-detail',
          component: () => import('@/views/tickets/TicketDetailView.vue'),
        },
        // Users (Admin only)
        {
          path: 'users',
          name: 'users',
          component: () => import('@/views/users/UsersView.vue'),
          meta: { roles: [UserRole.ADMIN, UserRole.SUPERVISOR] },
        },
        // Categories (Admin only)
        {
          path: 'categories',
          name: 'categories',
          component: () => import('@/views/categories/CategoriesView.vue'),
          meta: { roles: [UserRole.ADMIN] },
        },
        // Profile
        {
          path: 'profile',
          name: 'profile',
          component: () => import('@/views/profile/ProfileView.vue'),
        },
        // Settings
        {
          path: 'settings',
          name: 'settings',
          component: () => import('@/views/settings/SettingsView.vue'),
          meta: { roles: [UserRole.ADMIN] },
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/dashboard',
    },
  ],
});

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } });
    return;
  }

  if (to.meta.guest && authStore.isAuthenticated) {
    next({ name: 'dashboard' });
    return;
  }

  // Role-based access control
  if (to.meta.roles && authStore.user) {
    const allowedRoles = to.meta.roles as UserRole[];
    if (!allowedRoles.includes(authStore.user.role)) {
      next({ name: 'dashboard' });
      return;
    }
  }

  next();
});

export default router;
