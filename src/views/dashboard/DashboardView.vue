<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import api from '@/services/api';
import type { Ticket, PaginatedResponse } from '@/types';

const router = useRouter();
const authStore = useAuthStore();

const user = computed(() => authStore.user);
const loading = ref(true);

const stats = ref({
  total: 0,
  open: 0,
  pending: 0,
  resolved: 0,
  resolvedToday: 0,
});

const recentTickets = ref<Ticket[]>([]);

const statusColors: Record<string, string> = {
  NEW: 'info',
  ASSIGNED: 'purple',
  IN_PROGRESS: 'warning',
  PENDING: 'amber',
  RESOLVED: 'success',
  CLOSED: 'grey',
  CANCELLED: 'error',
};

const priorityColors: Record<string, string> = {
  CRITICAL: 'error',
  HIGH: 'warning',
  MEDIUM: 'amber',
  LOW: 'success',
};

async function fetchDashboardData() {
  loading.value = true;
  try {
    const [statsRes, ticketsRes] = await Promise.all([
      api.get('/tickets/stats'),
      api.get<PaginatedResponse<Ticket>>('/tickets?limit=5'),
    ]);

    stats.value = statsRes.data;
    recentTickets.value = ticketsRes.data.data;
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
  } finally {
    loading.value = false;
  }
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function viewTicket(ticket: Ticket) {
  router.push(`/tickets/${ticket.id}`);
}

function createTicket() {
  router.push('/tickets/new');
}

function viewAllTickets() {
  router.push('/tickets');
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

onMounted(fetchDashboardData);
</script>

<template>
  <div class="dashboard">
    <!-- Header -->
    <div class="dashboard-header mb-8">
      <div>
        <h1 class="text-h4 font-weight-bold mb-1">{{ getGreeting() }}, {{ user?.fullName?.split(' ')[0] }}</h1>
        <p class="text-body-1 text-grey">Here's what's happening with your tickets today</p>
      </div>
      <v-btn color="primary" size="large" prepend-icon="mdi-plus" @click="createTicket" class="create-btn">
        New Ticket
      </v-btn>
    </div>

    <!-- Stats Cards -->
    <v-row class="mb-8">
      <v-col cols="12" sm="6" lg="3">
        <div class="stat-card gradient-primary">
          <div class="stat-icon">
            <v-icon size="28">mdi-ticket-outline</v-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ loading ? '-' : stats.open }}</div>
            <div class="stat-label">Open Tickets</div>
          </div>
        </div>
      </v-col>

      <v-col cols="12" sm="6" lg="3">
        <div class="stat-card gradient-warning">
          <div class="stat-icon">
            <v-icon size="28">mdi-clock-outline</v-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ loading ? '-' : stats.pending }}</div>
            <div class="stat-label">Pending</div>
          </div>
        </div>
      </v-col>

      <v-col cols="12" sm="6" lg="3">
        <div class="stat-card gradient-success">
          <div class="stat-icon">
            <v-icon size="28">mdi-check-circle-outline</v-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ loading ? '-' : stats.resolvedToday }}</div>
            <div class="stat-label">Resolved Today</div>
          </div>
        </div>
      </v-col>

      <v-col cols="12" sm="6" lg="3">
        <div class="stat-card gradient-info">
          <div class="stat-icon">
            <v-icon size="28">mdi-chart-box-outline</v-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ loading ? '-' : stats.total }}</div>
            <div class="stat-label">Total Tickets</div>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Recent Tickets -->
    <v-card class="tickets-card">
      <v-card-title class="d-flex justify-space-between align-center pa-6">
        <div class="d-flex align-center">
          <v-avatar color="primary" variant="tonal" size="40" class="mr-3">
            <v-icon>mdi-ticket</v-icon>
          </v-avatar>
          <div>
            <div class="text-h6 font-weight-bold">Recent Tickets</div>
            <div class="text-caption text-grey">Latest support requests</div>
          </div>
        </div>
        <v-btn variant="tonal" color="primary" size="small" @click="viewAllTickets">
          View All
          <v-icon end>mdi-arrow-right</v-icon>
        </v-btn>
      </v-card-title>

      <v-divider></v-divider>

      <div v-if="loading" class="pa-8 text-center">
        <v-progress-circular indeterminate color="primary" size="48"></v-progress-circular>
      </div>

      <v-table v-else-if="recentTickets.length > 0" class="tickets-table">
        <thead>
          <tr>
            <th>Ticket</th>
            <th>Title</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Created</th>
            <th class="text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="ticket in recentTickets" :key="ticket.id" class="ticket-row" @click="viewTicket(ticket)">
            <td>
              <span class="ticket-number">{{ ticket.ticketNumber }}</span>
            </td>
            <td>
              <div class="ticket-title">{{ ticket.title }}</div>
              <div class="ticket-requester text-caption text-grey">
                by {{ ticket.requester?.fullName || 'Unknown' }}
              </div>
            </td>
            <td>
              <v-chip :color="statusColors[ticket.status]" size="small" variant="flat" class="font-weight-medium">
                {{ ticket.status.replace('_', ' ') }}
              </v-chip>
            </td>
            <td>
              <v-chip :color="priorityColors[ticket.priority]" size="small" variant="tonal" class="font-weight-medium">
                {{ ticket.priority }}
              </v-chip>
            </td>
            <td>
              <span class="text-body-2">{{ formatDate(ticket.createdAt) }}</span>
            </td>
            <td class="text-center">
              <v-btn icon="mdi-arrow-right" variant="text" size="small" color="primary"></v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>

      <div v-else class="empty-state pa-12 text-center">
        <v-avatar color="grey-lighten-3" size="80" class="mb-4">
          <v-icon size="40" color="grey">mdi-ticket-outline</v-icon>
        </v-avatar>
        <h3 class="text-h6 font-weight-bold mb-2">No tickets yet</h3>
        <p class="text-body-2 text-grey mb-4">Create your first ticket to get started</p>
        <v-btn color="primary" @click="createTicket">
          <v-icon left>mdi-plus</v-icon>
          Create Ticket
        </v-btn>
      </div>
    </v-card>
  </div>
</template>

<style scoped>
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.create-btn {
  height: 48px !important;
  padding: 0 24px !important;
}

.stat-card {
  padding: 24px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.stat-card.gradient-primary {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
}

.stat-card.gradient-success {
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
  color: white;
}

.stat-card.gradient-warning {
  background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
  color: white;
}

.stat-card.gradient-info {
  background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
  color: white;
}

.stat-icon {
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.875rem;
  opacity: 0.9;
}

.tickets-card {
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.tickets-table {
  border-radius: 0;
}

.ticket-row {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.ticket-row:hover {
  background-color: #f8fafc !important;
}

.ticket-number {
  font-weight: 600;
  color: #6366f1;
}

.ticket-title {
  font-weight: 500;
  max-width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.empty-state {
  background: #f8fafc;
}

@media (max-width: 600px) {
  .dashboard-header {
    flex-direction: column;
    align-items: stretch;
  }

  .create-btn {
    width: 100%;
  }
}
</style>
