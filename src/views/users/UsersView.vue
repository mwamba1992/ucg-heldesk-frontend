<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import api from '@/services/api';
import type { User, PaginatedResponse } from '@/types';
import { UserRole } from '@/types';

const loading = ref(false);
const users = ref<User[]>([]);
const totalItems = ref(0);
const page = ref(1);
const itemsPerPage = ref(10);

const filters = ref({
  role: '' as string,
  isActive: '' as string,
});

const dialog = ref(false);
const editMode = ref(false);
const selectedUser = ref<User | null>(null);
const submitting = ref(false);

const form = ref({
  username: '',
  email: '',
  fullName: '',
  password: '',
  role: UserRole.REQUESTER,
  department: '',
  location: '',
});

const roleOptions = [
  { title: 'All Roles', value: '' },
  { title: 'Requester', value: UserRole.REQUESTER },
  { title: 'Agent', value: UserRole.AGENT },
  { title: 'Supervisor', value: UserRole.SUPERVISOR },
  { title: 'Admin', value: UserRole.ADMIN },
];

const roleColors: Record<string, string> = {
  REQUESTER: 'info',
  AGENT: 'success',
  SUPERVISOR: 'teal',
  ADMIN: 'error',
};

const statusOptions = [
  { title: 'All Status', value: '' },
  { title: 'Active', value: 'true' },
  { title: 'Inactive', value: 'false' },
];

const headers = [
  { title: 'Username', key: 'username', sortable: true },
  { title: 'Full Name', key: 'fullName', sortable: true },
  { title: 'Email', key: 'email', sortable: true },
  { title: 'Role', key: 'role', sortable: true },
  { title: 'Department', key: 'department', sortable: false },
  { title: 'Status', key: 'isActive', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false },
];

const rules = {
  username: [(v: string) => !!v || 'Username is required', (v: string) => v.length >= 3 || 'Min 3 characters'],
  email: [(v: string) => !!v || 'Email is required', (v: string) => /.+@.+\..+/.test(v) || 'Invalid email'],
  fullName: [(v: string) => !!v || 'Full name is required'],
  password: [(v: string) => !editMode.value || !v || v.length >= 6 || 'Min 6 characters'],
  newPassword: [(v: string) => !v || v.length >= 6 || 'Min 6 characters'],
};

async function fetchUsers() {
  loading.value = true;
  try {
    const params = new URLSearchParams({
      page: page.value.toString(),
      limit: itemsPerPage.value.toString(),
    });

    if (filters.value.role) params.append('role', filters.value.role);
    if (filters.value.isActive) params.append('isActive', filters.value.isActive);

    const response = await api.get<PaginatedResponse<User>>(`/users?${params}`);
    users.value = response.data.data;
    totalItems.value = response.data.meta.total;
  } catch (error) {
    console.error('Failed to fetch users:', error);
  } finally {
    loading.value = false;
  }
}

function openCreateDialog() {
  editMode.value = false;
  selectedUser.value = null;
  form.value = {
    username: '',
    email: '',
    fullName: '',
    password: '',
    role: UserRole.REQUESTER,
    department: '',
    location: '',
  };
  dialog.value = true;
}

function openEditDialog(user: User) {
  editMode.value = true;
  selectedUser.value = user;
  form.value = {
    username: user.username,
    email: user.email,
    fullName: user.fullName,
    password: '',
    role: user.role,
    department: user.department || '',
    location: user.location || '',
  };
  dialog.value = true;
}

async function submitForm() {
  submitting.value = true;
  try {
    const payload: Record<string, unknown> = {
      username: form.value.username,
      email: form.value.email,
      fullName: form.value.fullName,
      role: form.value.role,
    };

    if (form.value.department) payload.department = form.value.department;
    if (form.value.location) payload.location = form.value.location;

    if (editMode.value && selectedUser.value) {
      if (form.value.password) payload.password = form.value.password;
      await api.patch(`/users/${selectedUser.value.id}`, payload);
    } else {
      payload.password = form.value.password;
      await api.post('/users', payload);
    }

    dialog.value = false;
    await fetchUsers();
  } catch (error) {
    console.error('Failed to save user:', error);
  } finally {
    submitting.value = false;
  }
}

async function toggleUserStatus(user: User) {
  try {
    await api.patch(`/users/${user.id}`, { isActive: !user.isActive });
    await fetchUsers();
  } catch (error) {
    console.error('Failed to update user status:', error);
  }
}

watch([page, itemsPerPage, filters], fetchUsers, { deep: true });

onMounted(fetchUsers);
</script>

<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4">Users</h1>
        <p class="text-body-2 text-grey">Manage user accounts</p>
      </div>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateDialog">
        Add User
      </v-btn>
    </div>

    <v-card class="mb-4">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <v-select
              v-model="filters.role"
              :items="roleOptions"
              label="Role"
              hide-details
              density="compact"
            ></v-select>
          </v-col>
          <v-col cols="12" md="6">
            <v-select
              v-model="filters.isActive"
              :items="statusOptions"
              label="Status"
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
        :items="users"
        :loading="loading"
        :items-per-page="itemsPerPage"
        :page="page"
        :items-length="totalItems"
        @update:page="page = $event"
        @update:items-per-page="itemsPerPage = $event"
        class="elevation-0"
      >
        <template v-slot:item.role="{ item }">
          <v-chip :color="roleColors[item.role]" size="small" variant="tonal">
            {{ item.role }}
          </v-chip>
        </template>

        <template v-slot:item.isActive="{ item }">
          <v-chip :color="item.isActive ? 'green' : 'grey'" size="small" variant="tonal">
            {{ item.isActive ? 'Active' : 'Inactive' }}
          </v-chip>
        </template>

        <template v-slot:item.department="{ item }">
          {{ item.department || '-' }}
        </template>

        <template v-slot:item.actions="{ item }">
          <v-btn icon="mdi-pencil" variant="text" size="small" @click="openEditDialog(item)"></v-btn>
          <v-btn
            :icon="item.isActive ? 'mdi-account-off' : 'mdi-account-check'"
            variant="text"
            size="small"
            :color="item.isActive ? 'error' : 'success'"
            @click="toggleUserStatus(item)"
          ></v-btn>
        </template>

        <template v-slot:no-data>
          <div class="text-center py-8">
            <v-icon size="64" color="grey-lighten-1">mdi-account-group</v-icon>
            <p class="text-h6 mt-4">No users found</p>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Create/Edit Dialog -->
    <v-dialog v-model="dialog" max-width="600">
      <v-card>
        <v-card-title>
          {{ editMode ? 'Edit User' : 'Create User' }}
        </v-card-title>

        <v-card-text>
          <v-form @submit.prevent="submitForm">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.username"
                  label="Username"
                  :rules="rules.username"
                  :disabled="editMode"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.email"
                  label="Email"
                  type="email"
                  :rules="rules.email"
                  required
                ></v-text-field>
              </v-col>
            </v-row>

            <v-text-field
              v-model="form.fullName"
              label="Full Name"
              :rules="rules.fullName"
              required
            ></v-text-field>

            <v-text-field
              v-model="form.password"
              :label="editMode ? 'New Password (leave empty to keep current)' : 'Password'"
              type="password"
              :rules="editMode ? rules.newPassword : rules.password"
              :required="!editMode"
            ></v-text-field>

            <v-select
              v-model="form.role"
              :items="roleOptions.slice(1)"
              label="Role"
              required
            ></v-select>

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field v-model="form.department" label="Department"></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="form.location" label="Location"></v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="dialog = false">Cancel</v-btn>
          <v-btn
            color="primary"
            :loading="submitting"
            @click="submitForm"
          >
            {{ editMode ? 'Save Changes' : 'Create User' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
