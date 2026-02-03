<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '@/services/api';
import type { Category } from '@/types';

const loading = ref(false);
const categories = ref<Category[]>([]);

const dialog = ref(false);
const editMode = ref(false);
const selectedCategory = ref<Category | null>(null);
const submitting = ref(false);
const deleteDialog = ref(false);

const form = ref({
  name: '',
  description: '',
  parentId: '',
});

const rules = {
  name: [(v: string) => !!v || 'Name is required'],
};

async function fetchCategories() {
  loading.value = true;
  try {
    const response = await api.get<Category[]>('/categories?includeInactive=true');
    categories.value = response.data;
  } catch (error) {
    console.error('Failed to fetch categories:', error);
  } finally {
    loading.value = false;
  }
}

function openCreateDialog() {
  editMode.value = false;
  selectedCategory.value = null;
  form.value = {
    name: '',
    description: '',
    parentId: '',
  };
  dialog.value = true;
}

function openEditDialog(category: Category) {
  editMode.value = true;
  selectedCategory.value = category;
  form.value = {
    name: category.name,
    description: category.description || '',
    parentId: category.parentId || '',
  };
  dialog.value = true;
}

function openDeleteDialog(category: Category) {
  selectedCategory.value = category;
  deleteDialog.value = true;
}

async function submitForm() {
  if (!form.value.name) return;

  submitting.value = true;
  try {
    const payload: Record<string, unknown> = {
      name: form.value.name,
    };

    if (form.value.description) payload.description = form.value.description;
    if (form.value.parentId) payload.parentId = form.value.parentId;

    if (editMode.value && selectedCategory.value) {
      await api.patch(`/categories/${selectedCategory.value.id}`, payload);
    } else {
      await api.post('/categories', payload);
    }

    dialog.value = false;
    await fetchCategories();
  } catch (error) {
    console.error('Failed to save category:', error);
  } finally {
    submitting.value = false;
  }
}

async function deleteCategory() {
  if (!selectedCategory.value) return;

  try {
    await api.delete(`/categories/${selectedCategory.value.id}`);
    deleteDialog.value = false;
    await fetchCategories();
  } catch (error) {
    console.error('Failed to delete category:', error);
  }
}

async function toggleCategoryStatus(category: Category) {
  try {
    await api.patch(`/categories/${category.id}`, { isActive: !category.isActive });
    await fetchCategories();
  } catch (error) {
    console.error('Failed to update category:', error);
  }
}

onMounted(fetchCategories);
</script>

<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4">Categories</h1>
        <p class="text-body-2 text-grey">Manage ticket categories</p>
      </div>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateDialog">
        Add Category
      </v-btn>
    </div>

    <v-card>
      <v-list v-if="categories.length > 0">
        <template v-for="category in categories" :key="category.id">
          <v-list-item>
            <template v-slot:prepend>
              <v-icon :color="category.isActive ? 'primary' : 'grey'">mdi-folder</v-icon>
            </template>

            <v-list-item-title>
              {{ category.name }}
              <v-chip v-if="!category.isActive" size="x-small" color="grey" class="ml-2">
                Inactive
              </v-chip>
            </v-list-item-title>

            <v-list-item-subtitle v-if="category.description">
              {{ category.description }}
            </v-list-item-subtitle>

            <template v-slot:append>
              <v-btn icon="mdi-pencil" variant="text" size="small" @click="openEditDialog(category)"></v-btn>
              <v-btn
                :icon="category.isActive ? 'mdi-eye-off' : 'mdi-eye'"
                variant="text"
                size="small"
                @click="toggleCategoryStatus(category)"
              ></v-btn>
              <v-btn icon="mdi-delete" variant="text" size="small" color="error" @click="openDeleteDialog(category)"></v-btn>
            </template>
          </v-list-item>

          <v-divider></v-divider>
        </template>
      </v-list>

      <div v-else-if="!loading" class="text-center py-8">
        <v-icon size="64" color="grey-lighten-1">mdi-folder-multiple</v-icon>
        <p class="text-h6 mt-4">No categories found</p>
        <p class="text-body-2 text-grey">Create your first category</p>
        <v-btn color="primary" class="mt-4" @click="openCreateDialog">
          Add Category
        </v-btn>
      </div>

      <div v-if="loading" class="text-center py-8">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </div>
    </v-card>

    <!-- Create/Edit Dialog -->
    <v-dialog v-model="dialog" max-width="500">
      <v-card>
        <v-card-title>
          {{ editMode ? 'Edit Category' : 'Create Category' }}
        </v-card-title>

        <v-card-text>
          <v-form @submit.prevent="submitForm">
            <v-text-field
              v-model="form.name"
              label="Name"
              :rules="rules.name"
              required
              class="mb-4"
            ></v-text-field>

            <v-textarea
              v-model="form.description"
              label="Description"
              rows="3"
              class="mb-4"
            ></v-textarea>

            <v-select
              v-model="form.parentId"
              :items="categories.filter(c => c.id !== selectedCategory?.id)"
              item-title="name"
              item-value="id"
              label="Parent Category (optional)"
              clearable
            ></v-select>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="dialog = false">Cancel</v-btn>
          <v-btn
            color="primary"
            :loading="submitting"
            :disabled="!form.name"
            @click="submitForm"
          >
            {{ editMode ? 'Save Changes' : 'Create' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title>Delete Category</v-card-title>
        <v-card-text>
          Are you sure you want to deactivate the category "{{ selectedCategory?.name }}"?
          This will hide it from the category selection.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="error" @click="deleteCategory">Deactivate</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
