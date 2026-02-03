<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const drawer = ref(true);
const rail = ref(false);

const user = computed(() => authStore.user);

const navigationItems = computed(() => {
  const items = [
    { title: 'Dashboard', icon: 'mdi-view-dashboard-outline', to: '/dashboard' },
    { title: 'Tickets', icon: 'mdi-ticket-outline', to: '/tickets' },
  ];

  if (user.value?.role === 'ADMIN' || user.value?.role === 'SUPERVISOR') {
    items.push({ title: 'Users', icon: 'mdi-account-group-outline', to: '/users' });
  }

  if (user.value?.role === 'ADMIN') {
    items.push(
      { title: 'Categories', icon: 'mdi-folder-multiple-outline', to: '/categories' },
      { title: 'Settings', icon: 'mdi-cog-outline', to: '/settings' }
    );
  }

  return items;
});

async function handleLogout() {
  await authStore.logout();
  router.push('/login');
}

function getUserInitials(name: string | undefined) {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
</script>

<template>
  <v-navigation-drawer
    v-model="drawer"
    :rail="rail"
    permanent
    class="modern-drawer"
  >
    <div class="drawer-header pa-4">
      <div class="d-flex align-center">
        <v-avatar color="primary" size="42" class="brand-avatar" :class="{ 'mr-3': !rail }">
          <v-icon>mdi-headset</v-icon>
        </v-avatar>
        <Transition name="fade">
          <div v-if="!rail" class="brand-text">
            <div class="text-subtitle-1 font-weight-bold">MHB Help Desk</div>
            <div class="text-caption text-grey">Support Portal</div>
          </div>
        </Transition>
      </div>
    </div>

    <v-divider class="mx-4"></v-divider>

    <v-list class="pa-2" density="comfortable" nav>
      <v-list-item
        v-for="item in navigationItems"
        :key="item.title"
        :prepend-icon="item.icon"
        :title="item.title"
        :to="item.to"
        rounded="lg"
        class="nav-item mb-1"
        color="primary"
      ></v-list-item>
    </v-list>

    <template v-slot:append>
      <v-divider class="mx-4 mb-2"></v-divider>

      <v-list class="pa-2" density="comfortable" nav>
        <v-list-item
          prepend-icon="mdi-logout"
          title="Logout"
          rounded="lg"
          class="nav-item logout-item"
          @click="handleLogout"
        ></v-list-item>
      </v-list>

      <div class="rail-toggle pa-2">
        <v-btn
          :icon="rail ? 'mdi-chevron-right' : 'mdi-chevron-left'"
          variant="tonal"
          size="small"
          @click="rail = !rail"
        ></v-btn>
      </div>
    </template>
  </v-navigation-drawer>

  <v-app-bar elevation="0" class="modern-appbar">
    <v-app-bar-nav-icon @click="drawer = !drawer" class="d-lg-none"></v-app-bar-nav-icon>

    <v-spacer></v-spacer>

    <v-btn icon variant="text" class="mr-2">
      <v-badge color="error" content="3" overlap>
        <v-icon>mdi-bell-outline</v-icon>
      </v-badge>
    </v-btn>

    <v-menu offset-y>
      <template v-slot:activator="{ props }">
        <v-btn v-bind="props" variant="text" class="user-menu-btn" rounded="lg">
          <v-avatar color="primary" size="36" class="mr-2">
            <span class="text-body-2 font-weight-medium">{{ getUserInitials(user?.fullName) }}</span>
          </v-avatar>
          <div class="d-none d-sm-block text-left">
            <div class="text-body-2 font-weight-medium">{{ user?.fullName }}</div>
            <div class="text-caption text-grey">{{ user?.role }}</div>
          </div>
          <v-icon class="ml-1 d-none d-sm-block">mdi-chevron-down</v-icon>
        </v-btn>
      </template>

      <v-card min-width="280" class="user-menu-card" rounded="lg">
        <v-card-text class="pa-4">
          <div class="d-flex align-center mb-3">
            <v-avatar color="primary" size="48" class="mr-3">
              <span class="text-h6">{{ getUserInitials(user?.fullName) }}</span>
            </v-avatar>
            <div>
              <div class="text-subtitle-1 font-weight-bold">{{ user?.fullName }}</div>
              <div class="text-body-2 text-grey">{{ user?.email }}</div>
            </div>
          </div>
          <v-chip color="primary" variant="tonal" size="small" class="mb-2">
            {{ user?.role }}
          </v-chip>
        </v-card-text>

        <v-divider></v-divider>

        <v-list density="compact" class="pa-2">
          <v-list-item
            prepend-icon="mdi-account-outline"
            title="My Profile"
            to="/profile"
            rounded="lg"
          ></v-list-item>
          <v-list-item
            prepend-icon="mdi-cog-outline"
            title="Settings"
            to="/settings"
            rounded="lg"
          ></v-list-item>
        </v-list>

        <v-divider></v-divider>

        <v-list density="compact" class="pa-2">
          <v-list-item
            prepend-icon="mdi-logout"
            title="Sign Out"
            rounded="lg"
            class="text-error"
            @click="handleLogout"
          ></v-list-item>
        </v-list>
      </v-card>
    </v-menu>
  </v-app-bar>

  <v-main class="main-content">
    <v-container fluid class="pa-6">
      <router-view />
    </v-container>
  </v-main>
</template>

<style scoped>
.modern-drawer {
  background: white !important;
  border-right: 1px solid rgba(0, 0, 0, 0.06) !important;
}

.drawer-header {
  min-height: 72px;
  display: flex;
  align-items: center;
}

.brand-avatar {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
}

.brand-text {
  overflow: hidden;
  white-space: nowrap;
}

.nav-item {
  margin-bottom: 4px;
}

.nav-item:deep(.v-list-item__prepend > .v-icon) {
  margin-right: 12px;
  opacity: 0.8;
}

.nav-item.v-list-item--active {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
}

.nav-item.v-list-item--active:deep(.v-icon) {
  color: #6366f1;
  opacity: 1;
}

.logout-item:hover {
  color: #ef4444 !important;
}

.rail-toggle {
  display: flex;
  justify-content: center;
}

.modern-appbar {
  background: white !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06) !important;
}

.user-menu-btn {
  height: 52px !important;
  padding: 8px 12px !important;
}

.user-menu-card {
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1) !important;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.main-content {
  background: #f8fafc;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
