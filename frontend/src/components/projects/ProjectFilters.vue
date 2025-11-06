<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { StatusEnum } from '@/schemas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search } from 'lucide-vue-next'
import { STATUS_OPTIONS } from '@/constants/projects'

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
  status: props.modelValue.status || 'undefined',
  search: props.modelValue.search || '',
  ordering: props.modelValue.ordering || '-created_at',
})

// Watch for external changes
watch(
  () => props.modelValue,
  (newValue) => {
    localFilters.value = {
      status: newValue.status || 'undefined',
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

  // Only include status if it's not "undefined" (which means "All Statuses")
  if (localFilters.value.status && localFilters.value.status !== 'undefined') {
    filters.status = localFilters.value.status as 'draft' | 'active' | 'completed' | 'archived'
  }

  if (localFilters.value.search) {
    filters.search = localFilters.value.search
  }

  emit('update:modelValue', filters)
}

// Clear all filters
function clearFilters(): void {
  // Emit the cleared filters state - don't update local state directly
  // The parent component should update props, which will then update local state via the watcher
  emit('update:modelValue', {
    ordering: '-created_at',
  })
}

// Check if any filters are active
const hasActiveFilters = computed(() => {
  const hasStatus = localFilters.value.status && localFilters.value.status !== 'undefined'
  return !!(hasStatus || localFilters.value.search)
})

// Status options with "All Statuses" option
const statusFilterOptions = computed(() => [
  { value: 'undefined', label: 'All Statuses' },
  ...STATUS_OPTIONS,
])

// Sorting options
const SORT_OPTIONS = [
  { value: '-created_at', label: 'Newest First' },
  { value: 'created_at', label: 'Oldest First' },
  { value: 'name', label: 'Name (A-Z)' },
  { value: '-name', label: 'Name (Z-A)' },
  { value: 'due_date', label: 'Due Date (Earliest)' },
  { value: '-due_date', label: 'Due Date (Latest)' },
  { value: 'priority', label: 'Priority (Low to High)' },
  { value: '-priority', label: 'Priority (High to Low)' },
] as const
</script>

<template>
  <div class="flex flex-wrap items-center gap-3 p-4 bg-card rounded-lg shadow-sm border mb-6">
    <!-- Search -->
    <div class="flex-1 min-w-[200px] relative">
      <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        v-model="localFilters.search"
        type="text"
        placeholder="Search projects..."
        class="pl-9"
        @input="updateFilters"
      />
    </div>

    <!-- Status Filter -->
    <div class="flex-shrink-0">
      <Select v-model="localFilters.status" @update:model-value="updateFilters">
        <SelectTrigger class="w-[160px]">
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            v-for="option in statusFilterOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    <!-- Sort By -->
    <div class="flex-shrink-0">
      <Select v-model="localFilters.ordering" @update:model-value="updateFilters">
        <SelectTrigger class="w-[180px]" aria-label="Sort projects">
          <SelectValue placeholder="Sort by..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            v-for="option in SORT_OPTIONS"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    <!-- Clear Filters Button -->
    <Button
      v-if="hasActiveFilters"
      variant="secondary"
      size="sm"
      class="whitespace-nowrap"
      @click="clearFilters"
    >
      Clear Filters
    </Button>
  </div>
</template>

