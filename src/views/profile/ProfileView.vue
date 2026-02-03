<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import api from '@/services/api';

const authStore = useAuthStore();

const loading = ref(false);
const saving = ref(false);
const changingPassword = ref(false);
const snackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('success');

const user = computed(() => authStore.user);

const profileForm = ref({
  fullName: '',
  email: '',
  department: '',
  location: '',
});

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const passwordRules = {
  currentPassword: [(v: string) => !!v || 'Current password is required'],
  newPassword: [
    (v: string) => !!v || 'New password is required',
    (v: string) => v.length >= 6 || 'Password must be at least 6 characters',
  ],
  confirmPassword: [
    (v: string) => !!v || 'Please confirm your password',
    (v: string) => v === passwordForm.value.newPassword || 'Passwords do not match',
  ],
};

function loadProfile() {
  if (user.value) {
    profileForm.value = {
      fullName: user.value.fullName || '',
      email: user.value.email || '',
      department: user.value.department || '',
      location: user.value.location || '',
    };
  }
}

async function saveProfile() {
  saving.value = true;
  try {
    await api.patch(`/users/${user.value?.id}`, {
      fullName: profileForm.value.fullName,
      email: profileForm.value.email,
      department: profileForm.value.department || undefined,
      location: profileForm.value.location || undefined,
    });

    await authStore.fetchProfile();
    showSnackbar('Profile updated successfully', 'success');
  } catch (error) {
    console.error('Failed to update profile:', error);
    showSnackbar('Failed to update profile', 'error');
  } finally {
    saving.value = false;
  }
}

async function changePassword() {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    showSnackbar('Passwords do not match', 'error');
    return;
  }

  changingPassword.value = true;
  try {
    await api.patch(`/users/${user.value?.id}`, {
      password: passwordForm.value.newPassword,
    });

    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    };

    showSnackbar('Password changed successfully', 'success');
  } catch (error) {
    console.error('Failed to change password:', error);
    showSnackbar('Failed to change password', 'error');
  } finally {
    changingPassword.value = false;
  }
}

function showSnackbar(message: string, color: string) {
  snackbarMessage.value = message;
  snackbarColor.value = color;
  snackbar.value = true;
}

onMounted(loadProfile);
</script>

<template>
  <div>
    <h1 class="text-h4 mb-6">My Profile</h1>

    <v-row>
      <v-col cols="12" md="4">
        <v-card>
          <v-card-text class="text-center">
            <v-avatar color="primary" size="100" class="mb-4">
              <span class="text-h4">
                {{
                  user?.fullName
                    ?.split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase() || 'U'
                }}
              </span>
            </v-avatar>

            <h3 class="text-h5">{{ user?.fullName }}</h3>
            <p class="text-body-2 text-grey">@{{ user?.username }}</p>

            <v-chip color="primary" variant="tonal" class="mt-2">
              {{ user?.role }}
            </v-chip>

            <v-divider class="my-4"></v-divider>

            <v-list density="compact">
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon>mdi-email</v-icon>
                </template>
                <v-list-item-title>{{ user?.email }}</v-list-item-title>
              </v-list-item>

              <v-list-item v-if="user?.department">
                <template v-slot:prepend>
                  <v-icon>mdi-domain</v-icon>
                </template>
                <v-list-item-title>{{ user?.department }}</v-list-item-title>
              </v-list-item>

              <v-list-item v-if="user?.location">
                <template v-slot:prepend>
                  <v-icon>mdi-map-marker</v-icon>
                </template>
                <v-list-item-title>{{ user?.location }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="8">
        <v-card class="mb-4">
          <v-card-title>
            <v-icon class="mr-2">mdi-account-edit</v-icon>
            Edit Profile
          </v-card-title>

          <v-card-text>
            <v-form @submit.prevent="saveProfile">
              <v-text-field
                v-model="profileForm.fullName"
                label="Full Name"
                required
              ></v-text-field>

              <v-text-field
                v-model="profileForm.email"
                label="Email"
                type="email"
                required
              ></v-text-field>

              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="profileForm.department"
                    label="Department"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="profileForm.location"
                    label="Location"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" :loading="saving" @click="saveProfile">
              Save Changes
            </v-btn>
          </v-card-actions>
        </v-card>

        <v-card>
          <v-card-title>
            <v-icon class="mr-2">mdi-lock</v-icon>
            Change Password
          </v-card-title>

          <v-card-text>
            <v-form @submit.prevent="changePassword">
              <v-text-field
                v-model="passwordForm.currentPassword"
                label="Current Password"
                type="password"
                :rules="passwordRules.currentPassword"
              ></v-text-field>

              <v-text-field
                v-model="passwordForm.newPassword"
                label="New Password"
                type="password"
                :rules="passwordRules.newPassword"
              ></v-text-field>

              <v-text-field
                v-model="passwordForm.confirmPassword"
                label="Confirm New Password"
                type="password"
                :rules="passwordRules.confirmPassword"
              ></v-text-field>
            </v-form>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              :loading="changingPassword"
              :disabled="!passwordForm.newPassword || !passwordForm.confirmPassword"
              @click="changePassword"
            >
              Change Password
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="3000">
      {{ snackbarMessage }}
    </v-snackbar>
  </div>
</template>
