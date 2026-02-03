<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/services/api';
import { useAuthStore } from '@/stores/auth';
import type { Ticket, Comment, User } from '@/types';
import { TicketStatus, Priority, UserRole } from '@/types';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const loading = ref(true);
const ticket = ref<Ticket | null>(null);
const comments = ref<Comment[]>([]);
const agents = ref<User[]>([]);

const newComment = ref('');
const isInternalComment = ref(false);
const submittingComment = ref(false);

const editDialog = ref(false);
const assignDialog = ref(false);
const selectedAgent = ref('');

const editForm = ref({
  status: '' as TicketStatus,
  priority: '' as Priority,
});

const currentUser = computed(() => authStore.user);
const isAgent = computed(() =>
  currentUser.value?.role === UserRole.AGENT ||
  currentUser.value?.role === UserRole.SUPERVISOR ||
  currentUser.value?.role === UserRole.ADMIN
);

const statusColors: Record<string, string> = {
  NEW: 'blue',
  ASSIGNED: 'purple',
  IN_PROGRESS: 'orange',
  PENDING: 'amber',
  RESOLVED: 'green',
  CLOSED: 'grey',
  CANCELLED: 'red',
};

const priorityColors: Record<string, string> = {
  CRITICAL: 'red',
  HIGH: 'orange',
  MEDIUM: 'amber',
  LOW: 'green',
};

const statusOptions = [
  { title: 'New', value: TicketStatus.NEW },
  { title: 'Assigned', value: TicketStatus.ASSIGNED },
  { title: 'In Progress', value: TicketStatus.IN_PROGRESS },
  { title: 'Pending', value: TicketStatus.PENDING },
  { title: 'Resolved', value: TicketStatus.RESOLVED },
  { title: 'Closed', value: TicketStatus.CLOSED },
  { title: 'Cancelled', value: TicketStatus.CANCELLED },
];

const priorityOptions = [
  { title: 'Critical', value: Priority.CRITICAL },
  { title: 'High', value: Priority.HIGH },
  { title: 'Medium', value: Priority.MEDIUM },
  { title: 'Low', value: Priority.LOW },
];

async function fetchTicket() {
  loading.value = true;
  try {
    const [ticketRes, commentsRes] = await Promise.all([
      api.get<Ticket>(`/tickets/${route.params.id}`),
      api.get<Comment[]>(`/tickets/${route.params.id}/comments`),
    ]);
    ticket.value = ticketRes.data;
    comments.value = commentsRes.data;
    editForm.value.status = ticket.value.status;
    editForm.value.priority = ticket.value.priority;
  } catch (error) {
    console.error('Failed to fetch ticket:', error);
    router.push('/tickets');
  } finally {
    loading.value = false;
  }
}

async function fetchAgents() {
  try {
    const response = await api.get('/users?role=AGENT&isActive=true');
    agents.value = response.data.data;
  } catch (error) {
    console.error('Failed to fetch agents:', error);
  }
}

async function submitComment() {
  if (!newComment.value.trim()) return;

  submittingComment.value = true;
  try {
    await api.post(`/tickets/${route.params.id}/comments`, {
      body: newComment.value,
      isInternal: isInternalComment.value,
    });
    newComment.value = '';
    isInternalComment.value = false;
    await fetchTicket();
  } catch (error) {
    console.error('Failed to add comment:', error);
  } finally {
    submittingComment.value = false;
  }
}

async function updateTicket() {
  try {
    await api.patch(`/tickets/${route.params.id}`, editForm.value);
    editDialog.value = false;
    await fetchTicket();
  } catch (error) {
    console.error('Failed to update ticket:', error);
  }
}

async function assignTicket() {
  if (!selectedAgent.value) return;

  try {
    await api.patch(`/tickets/${route.params.id}/assign`, {
      assignedTo: selectedAgent.value,
    });
    assignDialog.value = false;
    selectedAgent.value = '';
    await fetchTicket();
  } catch (error) {
    console.error('Failed to assign ticket:', error);
  }
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateString);
}

onMounted(() => {
  fetchTicket();
  if (isAgent.value) {
    fetchAgents();
  }
});
</script>

<template>
  <div>
    <v-btn variant="text" prepend-icon="mdi-arrow-left" class="mb-4" @click="router.push('/tickets')">
      Back to Tickets
    </v-btn>

    <div v-if="loading" class="text-center py-8">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>

    <template v-else-if="ticket">
      <v-row>
        <v-col cols="12" md="8">
          <v-card class="mb-4">
            <v-card-title class="d-flex justify-space-between align-center">
              <div>
                <span class="text-primary font-weight-bold">{{ ticket.ticketNumber }}</span>
                <h2 class="text-h5 mt-2">{{ ticket.title }}</h2>
              </div>
              <div>
                <v-chip :color="statusColors[ticket.status]" variant="flat" class="mr-2">
                  {{ ticket.status.replace('_', ' ') }}
                </v-chip>
                <v-chip :color="priorityColors[ticket.priority]" variant="flat">
                  {{ ticket.priority }}
                </v-chip>
              </div>
            </v-card-title>

            <v-card-text>
              <div v-if="ticket.description" class="text-body-1 mb-4">
                {{ ticket.description }}
              </div>
              <div v-else class="text-grey text-body-2 mb-4">
                No description provided
              </div>

              <v-divider class="my-4"></v-divider>

              <v-row>
                <v-col cols="6" md="3">
                  <div class="text-caption text-grey">Created</div>
                  <div>{{ formatDate(ticket.createdAt) }}</div>
                </v-col>
                <v-col cols="6" md="3">
                  <div class="text-caption text-grey">Category</div>
                  <div>{{ ticket.category?.name || 'Uncategorized' }}</div>
                </v-col>
                <v-col cols="6" md="3">
                  <div class="text-caption text-grey">Location</div>
                  <div>{{ ticket.location || '-' }}</div>
                </v-col>
                <v-col cols="6" md="3">
                  <div class="text-caption text-grey">SLA Due</div>
                  <div>{{ ticket.slaDueAt ? formatDate(ticket.slaDueAt) : '-' }}</div>
                </v-col>
              </v-row>
            </v-card-text>

            <v-card-actions v-if="isAgent">
              <v-btn variant="outlined" prepend-icon="mdi-pencil" @click="editDialog = true">
                Edit
              </v-btn>
              <v-btn variant="outlined" prepend-icon="mdi-account-plus" @click="assignDialog = true">
                Assign
              </v-btn>
            </v-card-actions>
          </v-card>

          <!-- Comments Section -->
          <v-card>
            <v-card-title>
              <v-icon class="mr-2">mdi-comment-multiple</v-icon>
              Comments ({{ comments.length }})
            </v-card-title>

            <v-card-text>
              <div v-if="comments.length === 0" class="text-center py-4 text-grey">
                No comments yet
              </div>

              <v-timeline v-else density="compact" side="end">
                <v-timeline-item
                  v-for="comment in comments"
                  :key="comment.id"
                  :dot-color="comment.isInternal ? 'amber' : 'primary'"
                  size="small"
                >
                  <template v-slot:opposite>
                    <span class="text-caption text-grey">
                      {{ formatRelativeTime(comment.createdAt) }}
                    </span>
                  </template>

                  <v-card variant="outlined" :class="{ 'bg-amber-lighten-5': comment.isInternal }">
                    <v-card-text>
                      <div class="d-flex justify-space-between align-center mb-2">
                        <div class="font-weight-medium">
                          {{ comment.author?.fullName }}
                          <v-chip v-if="comment.isInternal" size="x-small" color="amber" class="ml-2">
                            Internal
                          </v-chip>
                        </div>
                      </div>
                      <div class="text-body-2">{{ comment.body }}</div>
                    </v-card-text>
                  </v-card>
                </v-timeline-item>
              </v-timeline>

              <v-divider class="my-4"></v-divider>

              <v-form @submit.prevent="submitComment">
                <v-textarea
                  v-model="newComment"
                  label="Add a comment"
                  rows="3"
                  auto-grow
                  :disabled="submittingComment"
                ></v-textarea>

                <div class="d-flex justify-space-between align-center">
                  <v-checkbox
                    v-if="isAgent"
                    v-model="isInternalComment"
                    label="Internal note (hidden from requester)"
                    density="compact"
                    hide-details
                  ></v-checkbox>
                  <div v-else></div>

                  <v-btn
                    type="submit"
                    color="primary"
                    :loading="submittingComment"
                    :disabled="!newComment.trim()"
                  >
                    Add Comment
                  </v-btn>
                </div>
              </v-form>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card class="mb-4">
            <v-card-title>Details</v-card-title>
            <v-list density="compact">
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon>mdi-account</v-icon>
                </template>
                <v-list-item-title>Requester</v-list-item-title>
                <v-list-item-subtitle>{{ ticket.requester?.fullName }}</v-list-item-subtitle>
              </v-list-item>

              <v-list-item>
                <template v-slot:prepend>
                  <v-icon>mdi-account-tie</v-icon>
                </template>
                <v-list-item-title>Assigned To</v-list-item-title>
                <v-list-item-subtitle>
                  {{ ticket.assignee?.fullName || 'Unassigned' }}
                </v-list-item-subtitle>
              </v-list-item>

              <v-list-item v-if="ticket.firstResponseAt">
                <template v-slot:prepend>
                  <v-icon>mdi-clock-check</v-icon>
                </template>
                <v-list-item-title>First Response</v-list-item-title>
                <v-list-item-subtitle>{{ formatDate(ticket.firstResponseAt) }}</v-list-item-subtitle>
              </v-list-item>

              <v-list-item v-if="ticket.resolvedAt">
                <template v-slot:prepend>
                  <v-icon>mdi-check-circle</v-icon>
                </template>
                <v-list-item-title>Resolved</v-list-item-title>
                <v-list-item-subtitle>{{ formatDate(ticket.resolvedAt) }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <!-- Edit Dialog -->
    <v-dialog v-model="editDialog" max-width="500">
      <v-card>
        <v-card-title>Edit Ticket</v-card-title>
        <v-card-text>
          <v-select
            v-model="editForm.status"
            :items="statusOptions"
            label="Status"
            class="mb-4"
          ></v-select>
          <v-select
            v-model="editForm.priority"
            :items="priorityOptions"
            label="Priority"
          ></v-select>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="editDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="updateTicket">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Assign Dialog -->
    <v-dialog v-model="assignDialog" max-width="500">
      <v-card>
        <v-card-title>Assign Ticket</v-card-title>
        <v-card-text>
          <v-select
            v-model="selectedAgent"
            :items="agents"
            item-title="fullName"
            item-value="id"
            label="Select Agent"
          ></v-select>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="assignDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="assignTicket" :disabled="!selectedAgent">Assign</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
