<script setup lang="ts">
import { ref, watch } from 'vue'
import type { StatusEnum } from '@/schemas'

// Props
const props = defineProps<{
  modelValue: {
    status?: StatusEnum
    search?: string
    ordering?: string
  }
}>()

// Emits
const emit = defineEmits<{
  'update:modelValue': [filters: typeof props.modelValue]
}>()

// Local state
const localFilters = ref({
  status: props.modelValue.status,
  search: props.modelValue.search || '',
  ordering: props.modelValue.ordering || '-created_at',
})

// Watch for external changes
watch(
  () => props.modelValue,
  (newValue) => {
    localFilters.value = {
      status: newValue.status,
      search: newValue.search || '',
      ordering: newValue.ordering || '-created_at',
    }
  }
)

// Emit changes
function updateFilters(): void {
  const filters: typeof props.modelValue = {
    ordering: localFilters.value.ordering,
  }

  if (localFilters.value.status) {
    filters.status = localFilters.value.status
  }

  if (localFilters.value.search) {
    filters.search = localFilters.value.search
  }

  emit('update:modelValue', filters)
}

// Clear all filters
function clearFilters(): void {
  localFilters.value = {
    status: undefined,
    search: '',
    ordering: '-created_at',
  }
  updateFilters()
}

// Check if any filters are active
const hasActiveFilters = ref(false)
watch(
  localFilters,
  () => {
    hasActiveFilters.value = !!(localFilters.value.status || localFilters.value.search)
  },
  { deep: true, immediate: true }
)
</script>

<template>
  <div class="project-filters">
    <!-- Search -->
    <div class="filter-group search-group">
      <input
        v-model="localFilters.search"
        type="text"
        class="filter-input search-input"
        placeholder="Search projects..."
        @input="updateFilters"
      />
    </div>

    <!-- Status Filter -->
    <div class="filter-group">
      <select
        v-model="localFilters.status"
        class="filter-select"
        @change="updateFilters"
      >
        <option :value="undefined">All Statuses</option>
        <option value="draft">Draft</option>
        <option value="active">Active</option>
        <option value="completed">Completed</option>
        <option value="archived">Archived</option>
      </select>
    </div>

    <!-- Sort By -->
    <div class="filter-group">
      <select
        v-model="localFilters.ordering"
        class="filter-select"
        @change="updateFilters"
      >
        <option value="-created_at">Newest First</option>
        <option value="created_at">Oldest First</option>
        <option value="name">Name (A-Z)</option>
        <option value="-name">Name (Z-A)</option>
        <option value="due_date">Due Date (Earliest)</option>
        <option value="-due_date">Due Date (Latest)</option>
        <option value="priority">Priority (Low to High)</option>
        <option value="-priority">Priority (High to Low)</option>
      </select>
    </div>

    <!-- Clear Filters Button -->
    <button
      v-if="hasActiveFilters"
      class="clear-btn"
      @click="clearFilters"
    >
      Clear Filters
    </button>
  </div>
</template>

<style scoped>
.project-filters {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  padding: 1rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
}

.filter-group {
  flex: 0 0 auto;
}

.search-group {
  flex: 1 1 auto;
  min-width: 200px;
}

.filter-input,
.filter-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: border-color 0.2s, box-shadow 0.2s;
  color: #111827;
  background: white;
}

.filter-input:focus,
.filter-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-input {
  width: 100%;
}

.clear-btn {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  background-color: #f3f4f6;
  color: #374151;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background-color 0.2s;
  white-space: nowrap;
}

.clear-btn:hover {
  background-color: #e5e7eb;
}

/* Responsive */
@media (max-width: 768px) {
  .project-filters {
    flex-wrap: wrap;
  }

  .search-group {
    flex-basis: 100%;
  }

  .filter-group {
    flex: 1 1 auto;
  }
}
</style>
