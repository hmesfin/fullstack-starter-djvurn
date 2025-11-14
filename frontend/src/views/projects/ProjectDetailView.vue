<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProject } from '@/composables/useProjects'
import { useProjects } from '@/composables/useProjects'
import ProjectForm from '@/components/projects/ProjectForm.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  ArrowLeft,
  Calendar,
  Clock,
  Loader2,
  Pencil,
  Trash2,
  AlertCircle,
} from 'lucide-vue-next'
import { STATUS_BADGES, PRIORITY_BADGES, STATUS_LABELS, PRIORITY_LABELS } from '@/constants/projects'
import type { PatchedProjectRequest } from '@/api/types.gen'

const route = useRoute()
const router = useRouter()

const uuid = computed(() => route.params['uuid'] as string)
const showEditForm = ref(false)

// Fetch single project
const { project, isLoading, error, refetch } = useProject(uuid.value)

// Use projects composable for mutations
const { updateProject, deleteProject, isUpdating, isDeleting } = useProjects()

// Computed properties
const statusBadgeVariant = computed(() => {
  if (!project.value?.status) return 'default'
  return STATUS_BADGES[project.value.status]
})

const priorityBadgeVariant = computed(() => {
  if (!project.value?.priority) return 'default'
  return PRIORITY_BADGES[project.value.priority]
})

const statusLabel = computed(() => {
  if (!project.value?.status) return ''
  return STATUS_LABELS[project.value.status]
})

const priorityLabel = computed(() => {
  if (!project.value?.priority) return ''
  return PRIORITY_LABELS[project.value.priority]
})

const formattedStartDate = computed(() => {
  if (!project.value?.start_date) return 'Not set'
  return new Date(project.value.start_date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

const formattedDueDate = computed(() => {
  if (!project.value?.due_date) return 'Not set'
  return new Date(project.value.due_date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

const formattedCreatedAt = computed(() => {
  if (!project.value?.created_at) return ''
  return new Date(project.value.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
})

const formattedUpdatedAt = computed(() => {
  if (!project.value?.updated_at) return ''
  return new Date(project.value.updated_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
})

// Handlers
function handleEdit(): void {
  showEditForm.value = true
}

function handleDelete(): void {
  if (!project.value) return

  const confirmed = window.confirm(
    `Are you sure you want to delete "${project.value.name}"? This action cannot be undone.`
  )

  if (confirmed) {
    deleteProject(project.value.uuid)
    // Navigate back to projects list after delete
    router.push({ name: 'dashboard' })
  }
}

function handleFormSubmit(data: Record<string, unknown>): void {
  if (!project.value) return

  updateProject(project.value.uuid, data as PatchedProjectRequest)
  showEditForm.value = false
  refetch()
}

function handleFormCancel(): void {
  showEditForm.value = false
}

function goBack(): void {
  router.push({ name: 'dashboard' })
}
</script>

<template>
  <div class="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
    <!-- Loading State -->
    <div
      v-if="isLoading"
      class="flex flex-col items-center justify-center py-16 gap-4"
      role="status"
      aria-live="polite"
    >
      <Loader2 class="h-10 w-10 animate-spin text-muted-foreground" aria-hidden="true" />
      <p class="text-muted-foreground">Loading project...</p>
    </div>

    <!-- Error State -->
    <Alert v-else-if="error" variant="destructive" class="my-8">
      <AlertDescription class="flex flex-col items-center gap-4">
        <p class="text-lg">Failed to load project</p>
        <Button variant="outline" @click="() => refetch()">
          Try Again
        </Button>
      </AlertDescription>
    </Alert>

    <!-- Project Detail -->
    <template v-else-if="project && !showEditForm">
      <!-- Header with back button -->
      <div class="mb-6">
        <Button variant="ghost" size="sm" class="mb-4" @click="goBack">
          <ArrowLeft class="h-4 w-4 mr-2" />
          Back to Projects
        </Button>

        <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div class="flex-1">
            <h1 class="text-3xl font-bold text-foreground mb-2">{{ project.name }}</h1>
            <div class="flex flex-wrap gap-2">
              <Badge :variant="statusBadgeVariant">
                {{ statusLabel }}
              </Badge>
              <Badge :variant="priorityBadgeVariant">
                {{ priorityLabel }}
              </Badge>
              <Badge v-if="project.is_overdue" variant="destructive">
                <AlertCircle class="h-3 w-3 mr-1" />
                Overdue
              </Badge>
            </div>
          </div>

          <div class="flex gap-2">
            <Button variant="outline" size="sm" :disabled="isUpdating || isDeleting" @click="handleEdit">
              <Pencil class="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              :disabled="isUpdating || isDeleting"
              @click="handleDelete"
            >
              <Trash2 class="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      <!-- Project Details Card -->
      <Card class="mb-6">
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
          <CardDescription v-if="project.description">
            {{ project.description }}
          </CardDescription>
          <CardDescription v-else class="text-muted-foreground italic">
            No description provided
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <!-- Dates -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="flex items-start gap-3">
              <Calendar class="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p class="text-sm font-medium text-foreground">Start Date</p>
                <p class="text-sm text-muted-foreground">{{ formattedStartDate }}</p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <Clock class="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p class="text-sm font-medium text-foreground">Due Date</p>
                <p class="text-sm text-muted-foreground">{{ formattedDueDate }}</p>
              </div>
            </div>
          </div>

          <!-- Metadata -->
          <div class="pt-4 border-t border-border">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <span class="text-muted-foreground">Created:</span>
                <span class="ml-2 text-foreground">{{ formattedCreatedAt }}</span>
              </div>
              <div>
                <span class="text-muted-foreground">Last updated:</span>
                <span class="ml-2 text-foreground">{{ formattedUpdatedAt }}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </template>

    <!-- Edit Form -->
    <template v-else-if="showEditForm && project">
      <div class="mb-6">
        <Button variant="ghost" size="sm" class="mb-4" @click="handleFormCancel">
          <ArrowLeft class="h-4 w-4 mr-2" />
          Cancel Edit
        </Button>
        <h2 class="text-2xl font-bold text-foreground">Edit Project</h2>
      </div>

      <ProjectForm
        :project="project"
        :is-loading="isUpdating"
        @submit="handleFormSubmit"
        @cancel="handleFormCancel"
      />
    </template>
  </div>
</template>
