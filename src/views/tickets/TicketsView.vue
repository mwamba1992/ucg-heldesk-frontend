<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/services/api';
import type { Ticket, PaginatedResponse } from '@/types';
import { TicketStatus, Priority } from '@/types';

const router = useRouter();

const loading = ref(false);
const tickets = ref<Ticket[]>([]);
const totalItems = ref(0);
const page = ref(1);
const itemsPerPage = ref(10);

const filters = ref({
  status: '' as string,
  priority: '' as string,
  search: '',
});

const statusOptions = [
  { title: 'All Statuses', value: '' },
  { title: 'New', value: TicketStatus.NEW },
  { title: 'Assigned', value: TicketStatus.ASSIGNED },
  { title: 'In Progress', value: TicketStatus.IN_PROGRESS },
  { title: 'Pending', value: TicketStatus.PENDING },
  { title: 'Resolved', value: TicketStatus.RESOLVED },
  { title: 'Closed', value: TicketStatus.CLOSED },
];

const priorityOptions = [
  { title: 'All Priorities', value: '' },
  { title: 'Critical', value: Priority.CRITICAL },
  { title: 'High', value: Priority.HIGH },
  { title: 'Medium', value: Priority.MEDIUM },
  { title: 'Low', value: Priority.LOW },
];

const statusColors: Record<string, string> = {
  NEW: 'info',
  ASSIGNED: 'cyan',
  IN_PROGRESS: 'warning',
  PENDING: 'amber',
  RESOLVED: 'success',
  CLOSED: 'grey',
  CANCELLED: 'error',
};

const priorityColors: Record<string, string> = {
  CRITICAL: 'red',
  HIGH: 'orange',
  MEDIUM: 'amber',
  LOW: 'green',
};

const headers = [
  { title: 'Ticket #', key: 'ticketNumber', sortable: true },
  { title: 'Title', key: 'title', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Priority', key: 'priority', sortable: true },
  { title: 'Requester', key: 'requester.fullName', sortable: false },
  { title: 'Assigned To', key: 'assignee.fullName', sortable: false },
  { title: 'Created', key: 'createdAt', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false },
];

async function fetchTickets() {
  loading.value = true;
  try {
    const params = new URLSearchParams({
      page: page.value.toString(),
      limit: itemsPerPage.value.toString(),
    });

    if (filters.value.status) params.append('status', filters.value.status);
    if (filters.value.priority) params.append('priority', filters.value.priority);
    if (filters.value.search) params.append('search', filters.value.search);

    const response = await api.get<PaginatedResponse<Ticket>>(`/tickets?${params}`);
    tickets.value = response.data.data;
    totalItems.value = response.data.meta.total;
  } catch (error) {
    console.error('Failed to fetch tickets:', error);
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

watch([page, itemsPerPage, filters], fetchTickets, { deep: true });

onMounted(fetchTickets);
</script>

<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4">Tickets</h1>
        <p class="text-body-2 text-grey">Manage support tickets</p>
      </div>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="createTicket">
        New Ticket
      </v-btn>
    </div>

    <v-card class="mb-4">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="filters.search"
              label="Search"
              prepend-inner-icon="mdi-magnify"
              clearable
              hide-details
              density="compact"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="4">
            <v-select
              v-model="filters.status"
              :items="statusOptions"
              label="Status"
              hide-details
              density="compact"
            ></v-select>
          </v-col>
          <v-col cols="12" md="4">
            <v-select
              v-model="filters.priority"
              :items="priorityOptions"
              label="Priority"
              hide-details
              density="compact"
            ></v-select>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-card>
      <v-data-table
        :headers="headers"
        :items="tickets"
        :loading="loading"
        :items-per-page="itemsPerPage"
        :page="page"
        :items-length="totalItems"
        @update:page="page = $event"
        @update:items-per-page="itemsPerPage = $event"
        class="elevation-0"
      >
        <template v-slot:item.ticketNumber="{ item }">
          <span class="font-weight-medium text-primary cursor-pointer" @click="viewTicket(item)">
            {{ item.ticketNumber }}
          </span>
        </template>

        <template v-slot:item.title="{ item }">
          <span class="cursor-pointer" @click="viewTicket(item)">
            {{ item.title }}
          </span>
        </template>

        <template v-slot:item.status="{ item }">
          <v-chip :color="statusColors[item.status]" size="small" variant="tonal">
            {{ item.status.replace('_', ' ') }}
          </v-chip>
        </template>

        <template v-slot:item.priority="{ item }">
          <v-chip :color="priorityColors[item.priority]" size="small" variant="tonal">
            {{ item.priority }}
          </v-chip>
        </template>

        <template v-slot:item.requester.fullName="{ item }">
          {{ item.requester?.fullName || '-' }}
        </template>

        <template v-slot:item.assignee.fullName="{ item }">
          {{ item.assignee?.fullName || 'Unassigned' }}
        </template>

        <template v-slot:item.createdAt="{ item }">
          {{ formatDate(item.createdAt) }}
        </template>

        <template v-slot:item.actions="{ item }">
          <v-btn icon="mdi-eye" variant="text" size="small" @click="viewTicket(item)"></v-btn>
        </template>

        <template v-slot:no-data>
          <div class="text-center py-8">
            <v-icon size="64" color="grey-lighten-1">mdi-ticket-outline</v-icon>
            <p class="text-h6 mt-4">No tickets found</p>
            <p class="text-body-2 text-grey">Create your first ticket to get started</p>
            <v-btn color="primary" class="mt-4" @click="createTicket">
              Create Ticket
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
