<script setup lang="ts">
import { computed } from 'vue'
import type { Project } from '@/api/types.gen'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreVertical, Pencil, Trash2 } from 'lucide-vue-next'
import { getStatusConfig, getPriorityConfig } from '@/constants/projects'

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

// Get status and priority configs from centralized constants
const statusConfig = computed(() => getStatusConfig(props.project.status))
const priorityConfig = computed(() => getPriorityConfig(props.project.priority))

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
    const parts = date.split('-').map(Number)
    const year = parts[0]
    const month = parts[1]
    const day = parts[2]

    if (year === undefined || month === undefined || day === undefined) {
      return 'Invalid date'
    }

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
  <Card
    class="cursor-pointer transition-all hover:border-primary hover:shadow-md hover:-translate-y-0.5"
    :class="{ 'border-l-4 border-l-destructive': project.is_overdue }"
    @click="handleClick"
  >
    <!-- Header -->
    <CardHeader class="pb-3">
      <div class="flex items-start justify-between">
        <CardTitle class="text-lg font-semibold">{{ project.name }}</CardTitle>

        <!-- Actions Dropdown -->
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="ghost" size="icon" class="h-8 w-8" @click.stop>
              <MoreVertical class="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem @click="handleEdit">
              <Pencil class="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              class="text-destructive focus:text-destructive"
              :disabled="isDeleting"
              @click="handleDelete"
            >
              <Trash2 class="mr-2 h-4 w-4" />
              {{ isDeleting ? 'Deleting...' : 'Delete' }}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </CardHeader>

    <!-- Content -->
    <CardContent class="pb-3 space-y-3">
      <!-- Description -->
      <p v-if="project.description" class="text-sm text-muted-foreground leading-relaxed">
        {{ project.description }}
      </p>
      <p v-else class="text-sm text-muted-foreground italic">No description</p>

      <!-- Badges -->
      <div class="flex flex-wrap gap-2">
        <Badge :variant="statusConfig.variant">
          {{ statusConfig.label }}
        </Badge>
        <Badge :variant="priorityConfig.variant">
          {{ priorityConfig.label }}
        </Badge>
        <Badge v-if="project.is_overdue" variant="destructive">
          Overdue
        </Badge>
      </div>

      <!-- Dates -->
      <div class="flex gap-6 text-xs">
        <div v-if="project.start_date" class="flex gap-1.5">
          <span class="text-muted-foreground font-medium">Start:</span>
          <span class="text-foreground">{{ formatDate(project.start_date) }}</span>
        </div>
        <div v-if="project.due_date" class="flex gap-1.5">
          <span class="text-muted-foreground font-medium">Due:</span>
          <span class="text-foreground">{{ formatDate(project.due_date) }}</span>
        </div>
      </div>
    </CardContent>

    <!-- Footer -->
    <CardFooter class="pt-3 flex justify-between items-center text-xs text-muted-foreground border-t">
      <span class="font-medium">
        Owner: {{ project.owner_email }}
      </span>
      <span class="italic">
        Created {{ formatDate(project.created_at) }}
      </span>
    </CardFooter>
  </Card>
</template>
