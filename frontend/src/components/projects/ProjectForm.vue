<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { projectCreateSchema, projectPatchSchema, type StatusEnum, type PriorityEnum } from '@/schemas'
import type { Project } from '@/api/types.gen'
import type { ZodIssue } from 'zod'

// Props
const props = defineProps<{
  project?: Project | null
  isLoading?: boolean
}>()

// Emits
const emit = defineEmits<{
  submit: [data: Record<string, unknown>]
  cancel: []
}>()

// Determine if we're editing or creating
const isEditing = computed(() => !!props.project)

// Form state
const formData = ref({
  name: '',
  description: '',
  status: 'draft' as StatusEnum,
  priority: 2 as PriorityEnum,
  start_date: '',
  due_date: '',
})

// Field errors
const fieldErrors = ref<Record<string, string>>({})

// Priority labels
const priorityLabels: Record<PriorityEnum, string> = {
  1: 'Low',
  2: 'Medium',
  3: 'High',
  4: 'Critical',
}

// Status labels
const statusLabels: Record<StatusEnum, string> = {
  draft: 'Draft',
  active: 'Active',
  completed: 'Completed',
  archived: 'Archived',
}

/**
 * Initialize form with project data if editing
 */
onMounted(() => {
  if (props.project) {
    formData.value = {
      name: props.project.name,
      description: props.project.description || '',
      status: props.project.status || 'draft',
      priority: props.project.priority || 2,
      start_date: props.project.start_date || '',
      due_date: props.project.due_date || '',
    }
  }
})

/**
 * Validate form and submit
 */
function handleSubmit(): void {
  // Clear previous errors
  fieldErrors.value = {}

  // Choose schema based on mode
  const schema = isEditing.value ? projectPatchSchema : projectCreateSchema

  // Prepare data (convert empty strings to undefined for optional fields)
  const dataToValidate = {
    name: formData.value.name,
    description: formData.value.description || undefined,
    status: formData.value.status,
    priority: formData.value.priority,
    start_date: formData.value.start_date || null,
    due_date: formData.value.due_date || null,
  }

  // Validate with Zod schema
  const result = schema.safeParse(dataToValidate)

  if (!result.success) {
    // Map Zod errors to field errors
    result.error.issues.forEach((issue: ZodIssue) => {
      const field = issue.path[0]
      if (field && typeof field === 'string') {
        fieldErrors.value[field] = issue.message
      }
    })
    return
  }

  // Emit submit event with validated data
  emit('submit', result.data)
}

/**
 * Clear error for a specific field on input
 */
function clearFieldError(field: string): void {
  delete fieldErrors.value[field]
}

/**
 * Cancel form
 */
function handleCancel(): void {
  emit('cancel')
}
</script>

<template>
  <div class="project-form">
    <h2 class="form-title">
      {{ isEditing ? 'Edit Project' : 'Create New Project' }}
    </h2>

    <form @submit.prevent="handleSubmit" novalidate>
      <!-- Project Name -->
      <div class="form-group">
        <label for="name" class="form-label">
          Project Name <span class="required">*</span>
        </label>
        <input
          id="name"
          v-model="formData.name"
          type="text"
          class="form-input"
          :class="{ 'input-error': fieldErrors['name'] }"
          placeholder="Enter project name"
          @input="clearFieldError('name')"
        />
        <p v-if="fieldErrors['name']" class="error-message">
          {{ fieldErrors['name'] }}
        </p>
      </div>

      <!-- Description -->
      <div class="form-group">
        <label for="description" class="form-label">Description</label>
        <textarea
          id="description"
          v-model="formData.description"
          class="form-textarea"
          :class="{ 'input-error': fieldErrors['description'] }"
          placeholder="Enter project description (optional)"
          rows="4"
          @input="clearFieldError('description')"
        />
        <p v-if="fieldErrors['description']" class="error-message">
          {{ fieldErrors['description'] }}
        </p>
      </div>

      <!-- Status & Priority Row -->
      <div class="form-row">
        <!-- Status -->
        <div class="form-group">
          <label for="status" class="form-label">Status</label>
          <select
            id="status"
            v-model="formData.status"
            class="form-select"
            :class="{ 'input-error': fieldErrors['status'] }"
            @change="clearFieldError('status')"
          >
            <option v-for="(label, value) in statusLabels" :key="value" :value="value">
              {{ label }}
            </option>
          </select>
          <p v-if="fieldErrors['status']" class="error-message">
            {{ fieldErrors['status'] }}
          </p>
        </div>

        <!-- Priority -->
        <div class="form-group">
          <label for="priority" class="form-label">Priority</label>
          <select
            id="priority"
            v-model.number="formData.priority"
            class="form-select"
            :class="{ 'input-error': fieldErrors['priority'] }"
            @change="clearFieldError('priority')"
          >
            <option v-for="(label, value) in priorityLabels" :key="value" :value="Number(value)">
              {{ label }}
            </option>
          </select>
          <p v-if="fieldErrors['priority']" class="error-message">
            {{ fieldErrors['priority'] }}
          </p>
        </div>
      </div>

      <!-- Dates Row -->
      <div class="form-row">
        <!-- Start Date -->
        <div class="form-group">
          <label for="start_date" class="form-label">Start Date</label>
          <input
            id="start_date"
            v-model="formData.start_date"
            type="date"
            class="form-input"
            :class="{ 'input-error': fieldErrors['start_date'] }"
            @input="clearFieldError('start_date')"
          />
          <p v-if="fieldErrors['start_date']" class="error-message">
            {{ fieldErrors['start_date'] }}
          </p>
        </div>

        <!-- Due Date -->
        <div class="form-group">
          <label for="due_date" class="form-label">Due Date</label>
          <input
            id="due_date"
            v-model="formData.due_date"
            type="date"
            class="form-input"
            :class="{ 'input-error': fieldErrors['due_date'] }"
            @input="clearFieldError('due_date')"
          />
          <p v-if="fieldErrors['due_date']" class="error-message">
            {{ fieldErrors['due_date'] }}
          </p>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="form-actions">
        <button
          type="button"
          class="btn btn-secondary"
          :disabled="isLoading"
          @click="handleCancel"
        >
          Cancel
        </button>
        <button
          type="submit"
          class="btn btn-primary"
          :disabled="isLoading"
        >
          <span v-if="isLoading">{{ isEditing ? 'Updating...' : 'Creating...' }}</span>
          <span v-else>{{ isEditing ? 'Update Project' : 'Create Project' }}</span>
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.project-form {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #111827;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
  color: #374151;
}

.required {
  color: #ef4444;
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: border-color 0.2s, box-shadow 0.2s;
  color: #111827;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.input-error {
  border-color: #ef4444;
}

.input-error:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.error-message {
  margin-top: 0.375rem;
  font-size: 0.75rem;
  color: #ef4444;
}

.form-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.btn {
  padding: 0.625rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2563eb;
}

.btn-primary:disabled {
  background-color: #93c5fd;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #e5e7eb;
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
