<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/services/api';
import type { Category } from '@/types';
import { Priority } from '@/types';

const router = useRouter();

const loading = ref(false);
const categories = ref<Category[]>([]);

const form = ref({
  title: '',
  description: '',
  categoryId: '',
  priority: Priority.MEDIUM,
  location: '',
});

const rules = {
  title: [(v: string) => !!v || 'Title is required'],
};

const priorityOptions = [
  { title: 'Critical', value: Priority.CRITICAL, color: 'red' },
  { title: 'High', value: Priority.HIGH, color: 'orange' },
  { title: 'Medium', value: Priority.MEDIUM, color: 'amber' },
  { title: 'Low', value: Priority.LOW, color: 'green' },
];

async function fetchCategories() {
  try {
    const response = await api.get<Category[]>('/categories');
    categories.value = response.data;
  } catch (error) {
    console.error('Failed to fetch categories:', error);
  }
}

async function submitTicket() {
  if (!form.value.title) return;

  loading.value = true;
  try {
    const payload: Record<string, unknown> = {
      title: form.value.title,
      priority: form.value.priority,
    };

    if (form.value.description) payload.description = form.value.description;
    if (form.value.categoryId) payload.categoryId = form.value.categoryId;
    if (form.value.location) payload.location = form.value.location;

    const response = await api.post('/tickets', payload);
    router.push(`/tickets/${response.data.id}`);
  } catch (error) {
    console.error('Failed to create ticket:', error);
  } finally {
    loading.value = false;
  }
}

onMounted(fetchCategories);
</script>

<template>
  <div>
    <v-btn variant="text" prepend-icon="mdi-arrow-left" class="mb-4" @click="router.push('/tickets')">
      Back to Tickets
    </v-btn>

    <v-card max-width="800" class="mx-auto">
      <v-card-title>
        <v-icon class="mr-2">mdi-ticket-plus</v-icon>
        Create New Ticket
      </v-card-title>

      <v-card-text>
        <v-form @submit.prevent="submitTicket">
          <v-text-field
            v-model="form.title"
            label="Title"
            :rules="rules.title"
            required
            class="mb-4"
            placeholder="Brief description of the issue"
          ></v-text-field>

          <v-textarea
            v-model="form.description"
            label="Description"
            rows="4"
            class="mb-4"
            placeholder="Please provide details about the issue..."
          ></v-textarea>

          <v-row>
            <v-col cols="12" md="6">
              <v-select
                v-model="form.categoryId"
                :items="categories"
                item-title="name"
                item-value="id"
                label="Category"
                clearable
              ></v-select>
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                v-model="form.priority"
                :items="priorityOptions"
                label="Priority"
              >
                <template v-slot:item="{ props, item }">
                  <v-list-item v-bind="props">
                    <template v-slot:prepend>
                      <v-icon :color="item.raw.color">mdi-circle</v-icon>
                    </template>
                  </v-list-item>
                </template>
              </v-select>
            </v-col>
          </v-row>

          <v-text-field
            v-model="form.location"
            label="Location"
            placeholder="e.g., Building A, Floor 2"
            class="mb-4"
          ></v-text-field>

          <v-alert type="info" variant="tonal" class="mb-4">
            <strong>Priority Guidelines:</strong>
            <ul class="mt-2">
              <li><strong>Critical:</strong> Complete system outage, security breach</li>
              <li><strong>High:</strong> Major functionality broken, affecting multiple users</li>
              <li><strong>Medium:</strong> Single user affected, workaround available</li>
              <li><strong>Low:</strong> Minor issue, enhancement request</li>
            </ul>
          </v-alert>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="text" @click="router.push('/tickets')">Cancel</v-btn>
        <v-btn
          color="primary"
          :loading="loading"
          :disabled="!form.title"
          @click="submitTicket"
        >
          Create Ticket
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>
