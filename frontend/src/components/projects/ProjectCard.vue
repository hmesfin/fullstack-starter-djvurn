<script setup lang="ts">
import { computed } from 'vue'
import type { Project } from '@/api/types.gen'

// Props
const props = defineProps<{
  project: Project
  isDeleting?: boolean
}>()

// Emits
const emit = defineEmits<{
  edit: [project: Project]
  delete: [uuid: string]
  click: [project: Project]
}>()

// Priority labels and colors
const priorityConfig = {
  1: { label: 'Low', color: '#10b981', bg: '#d1fae5' },
  2: { label: 'Medium', color: '#3b82f6', bg: '#dbeafe' },
  3: { label: 'High', color: '#f59e0b', bg: '#fef3c7' },
  4: { label: 'Critical', color: '#ef4444', bg: '#fee2e2' },
} as const

// Status labels and colors
const statusConfig = {
  draft: { label: 'Draft', color: '#6b7280', bg: '#f3f4f6' },
  active: { label: 'Active', color: '#3b82f6', bg: '#dbeafe' },
  completed: { label: 'Completed', color: '#10b981', bg: '#d1fae5' },
  archived: { label: 'Archived', color: '#9ca3af', bg: '#f3f4f6' },
} as const

// Computed properties
const priorityStyle = computed(() => {
  const config = priorityConfig[props.project.priority || 2]
  return {
    color: config.color,
    backgroundColor: config.bg,
  }
})

const statusStyle = computed(() => {
  const config = statusConfig[props.project.status || 'draft']
  return {
    color: config.color,
    backgroundColor: config.bg,
  }
})

const priorityLabel = computed(() => {
  return priorityConfig[props.project.priority || 2]?.label ?? 'Medium'
})

const statusLabel = computed(() => {
  return statusConfig[props.project.status || 'draft']?.label ?? 'Draft'
})

// Format dates
const formatDate = (date: string | null): string => {
  if (!date) return 'Not set'

  // Parse date strings as local dates to avoid timezone issues
  // For ISO date strings (YYYY-MM-DD), create a local date
  if (date.includes('T')) {
    // Full ISO datetime - parse normally
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } else {
    // Date-only string (YYYY-MM-DD) - parse as local date
    const [year, month, day] = date.split('-').map(Number)
    return new Date(year, month - 1, day).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }
}

// Handlers
function handleEdit(event: Event): void {
  event.stopPropagation()
  emit('edit', props.project)
}

function handleDelete(event: Event): void {
  event.stopPropagation()
  if (confirm(`Delete project "${props.project.name}"?`)) {
    emit('delete', props.project.uuid)
  }
}

function handleClick(): void {
  emit('click', props.project)
}
</script>

<template>
  <div class="project-card" :class="{ 'is-overdue': project.is_overdue }" @click="handleClick">
    <!-- Header -->
    <div class="card-header">
      <h3 class="project-name">{{ project.name }}</h3>
      <div class="card-actions">
        <button
          class="action-btn edit-btn"
          title="Edit project"
          @click="handleEdit"
        >
          Edit
        </button>
        <button
          class="action-btn delete-btn"
          title="Delete project"
          :disabled="isDeleting"
          @click="handleDelete"
        >
          {{ isDeleting ? 'Deleting...' : 'Delete' }}
        </button>
      </div>
    </div>

    <!-- Description -->
    <p v-if="project.description" class="project-description">
      {{ project.description }}
    </p>
    <p v-else class="project-description empty">No description</p>

    <!-- Metadata -->
    <div class="card-metadata">
      <!-- Status & Priority Badges -->
      <div class="badges">
        <span class="badge" :style="statusStyle">
          {{ statusLabel }}
        </span>
        <span class="badge" :style="priorityStyle">
          {{ priorityLabel }}
        </span>
        <span v-if="project.is_overdue" class="badge badge-overdue">
          Overdue
        </span>
      </div>

      <!-- Dates -->
      <div class="dates">
        <div v-if="project.start_date" class="date-item">
          <span class="date-label">Start:</span>
          <span class="date-value">{{ formatDate(project.start_date) }}</span>
        </div>
        <div v-if="project.due_date" class="date-item">
          <span class="date-label">Due:</span>
          <span class="date-value">{{ formatDate(project.due_date) }}</span>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="card-footer">
      <span class="owner-info">
        Owner: {{ project.owner_email }}
      </span>
      <span class="created-info">
        Created {{ formatDate(project.created_at) }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.project-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1.25rem;
  cursor: pointer;
  transition: all 0.2s;
}

.project-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.project-card.is-overdue {
  border-left: 4px solid #ef4444;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.project-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
  flex: 1;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.edit-btn {
  background-color: #dbeafe;
  color: #1e40af;
}

.edit-btn:hover {
  background-color: #bfdbfe;
}

.delete-btn {
  background-color: #fee2e2;
  color: #991b1b;
}

.delete-btn:hover:not(:disabled) {
  background-color: #fecaca;
}

.delete-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.project-description {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.project-description.empty {
  font-style: italic;
  color: #9ca3af;
}

.card-metadata {
  margin-bottom: 1rem;
}

.badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.625rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 0.25rem;
}

.badge-overdue {
  background-color: #fee2e2;
  color: #991b1b;
}

.dates {
  display: flex;
  gap: 1.5rem;
  font-size: 0.75rem;
}

.date-item {
  display: flex;
  gap: 0.375rem;
}

.date-label {
  color: #6b7280;
  font-weight: 500;
}

.date-value {
  color: #111827;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.75rem;
  border-top: 1px solid #f3f4f6;
  font-size: 0.75rem;
  color: #6b7280;
}

.owner-info {
  font-weight: 500;
}

.created-info {
  font-style: italic;
}
</style>
