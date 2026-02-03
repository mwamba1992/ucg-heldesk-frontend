<script setup lang="ts">
import { ref } from 'vue';
import { useTheme } from 'vuetify';

const theme = useTheme();

const settings = ref({
  darkMode: theme.global.current.value.dark,
  notifications: true,
  emailNotifications: true,
  soundEnabled: true,
});

const snackbar = ref(false);
const snackbarMessage = ref('');

function toggleTheme() {
  theme.global.name.value = settings.value.darkMode ? 'dark' : 'light';
  saveSettings();
}

function saveSettings() {
  localStorage.setItem('helpdesk-settings', JSON.stringify(settings.value));
  snackbarMessage.value = 'Settings saved successfully';
  snackbar.value = true;
}

function loadSettings() {
  const saved = localStorage.getItem('helpdesk-settings');
  if (saved) {
    const parsed = JSON.parse(saved);
    settings.value = { ...settings.value, ...parsed };
    theme.global.name.value = settings.value.darkMode ? 'dark' : 'light';
  }
}

loadSettings();
</script>

<template>
  <div>
    <h1 class="text-h4 mb-6">Settings</h1>

    <v-row>
      <v-col cols="12" md="8">
        <v-card class="mb-4">
          <v-card-title>
            <v-icon class="mr-2">mdi-palette</v-icon>
            Appearance
          </v-card-title>

          <v-card-text>
            <v-switch
              v-model="settings.darkMode"
              label="Dark Mode"
              color="primary"
              hide-details
              @change="toggleTheme"
            ></v-switch>
          </v-card-text>
        </v-card>

        <v-card class="mb-4">
          <v-card-title>
            <v-icon class="mr-2">mdi-bell</v-icon>
            Notifications
          </v-card-title>

          <v-card-text>
            <v-switch
              v-model="settings.notifications"
              label="Enable Notifications"
              color="primary"
              hide-details
              class="mb-4"
              @change="saveSettings"
            ></v-switch>

            <v-switch
              v-model="settings.emailNotifications"
              label="Email Notifications"
              color="primary"
              hide-details
              :disabled="!settings.notifications"
              class="mb-4"
              @change="saveSettings"
            ></v-switch>

            <v-switch
              v-model="settings.soundEnabled"
              label="Sound Alerts"
              color="primary"
              hide-details
              :disabled="!settings.notifications"
              @change="saveSettings"
            ></v-switch>
          </v-card-text>
        </v-card>

        <v-card>
          <v-card-title>
            <v-icon class="mr-2">mdi-information</v-icon>
            About
          </v-card-title>

          <v-card-text>
            <v-list density="compact">
              <v-list-item>
                <v-list-item-title>Application</v-list-item-title>
                <v-list-item-subtitle>MHB Help Desk System</v-list-item-subtitle>
              </v-list-item>

              <v-list-item>
                <v-list-item-title>Version</v-list-item-title>
                <v-list-item-subtitle>1.0.0</v-list-item-subtitle>
              </v-list-item>

              <v-list-item>
                <v-list-item-title>Support</v-list-item-title>
                <v-list-item-subtitle>Contact IT Department</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>
            <v-icon class="mr-2">mdi-help-circle</v-icon>
            Help
          </v-card-title>

          <v-card-text>
            <v-list density="compact">
              <v-list-item prepend-icon="mdi-book-open-variant">
                <v-list-item-title>User Guide</v-list-item-title>
              </v-list-item>

              <v-list-item prepend-icon="mdi-frequently-asked-questions">
                <v-list-item-title>FAQ</v-list-item-title>
              </v-list-item>

              <v-list-item prepend-icon="mdi-keyboard">
                <v-list-item-title>Keyboard Shortcuts</v-list-item-title>
              </v-list-item>

              <v-list-item prepend-icon="mdi-email">
                <v-list-item-title>Contact Support</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar v-model="snackbar" color="success" timeout="2000">
      {{ snackbarMessage }}
    </v-snackbar>
  </div>
</template>
