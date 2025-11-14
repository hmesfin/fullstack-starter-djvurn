<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useProjects } from '@/composables/useProjects'
import ProjectCard from './ProjectCard.vue'
import ProjectFilters from './ProjectFilters.vue'
import ProjectForm from './ProjectForm.vue'
import { Pagination } from '@/components/ui/pagination'
import type { Project } from '@/api/types.gen'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { FileText, Loader2 } from 'lucide-vue-next'

const router = useRouter()

// State
const currentPage = ref(1)
const filters = ref<{
  status?: 'draft' | 'active' | 'completed' | 'archived'
  search?: string
  ordering?: string
}>({
  ordering: '-created_at',
})

const showCreateForm = ref(false)
const editingProject = ref<Project | null>(null)

// Computed filters with pagination
const filtersWithPage = computed(() => ({
  ...filters.value,
  page: currentPage.value,
}))

// Use projects composable with pagination
const {
  projects,
  totalCount,
  isLoading,
  error,
  createProject,
  updateProject,
  deleteProject,
  isCreating,
  isUpdating,
  isDeleting,
  refetch,
} = useProjects(filtersWithPage.value)

// Reset to page 1 when filters change
watch(
  () => filters.value,
  () => {
    currentPage.value = 1
  },
  { deep: true }
)

// Pagination constants
const PAGE_SIZE = 10
const totalPages = computed(() => Math.ceil(totalCount.value / PAGE_SIZE))

// Computed
const hasProjects = computed(() => (projects.value?.length ?? 0) > 0)
const isFormVisible = computed(() => showCreateForm.value || editingProject.value !== null)
const formLoading = computed(() => (showCreateForm.value ? isCreating : isUpdating))

// Handlers
function handleCreateClick(): void {
  editingProject.value = null
  showCreateForm.value = true
}

function handleEditProject(project: Project): void {
  editingProject.value = project
  showCreateForm.value = false
}

function handleDeleteProject(uuid: string): void {
  deleteProject(uuid)
}

function handleFormSubmit(data: Record<string, unknown>): void {
  if (editingProject.value) {
    // Update existing project (PATCH)
    updateProject(editingProject.value.uuid, data as Parameters<typeof updateProject>[1])
    editingProject.value = null
  } else {
    // Create new project
    createProject(data as Parameters<typeof createProject>[0])
    showCreateForm.value = false
  }
}

function handleFormCancel(): void {
  showCreateForm.value = false
  editingProject.value = null
}

function handleProjectClick(project: Project): void {
  router.push({ name: 'project-detail', params: { uuid: project.uuid } })
}

function handlePageChange(page: number): void {
  currentPage.value = page
  // Scroll to top when changing pages
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <div class="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <h1 class="text-3xl font-bold text-foreground">Projects</h1>
        <Button
          v-if="!isFormVisible"
          @click="handleCreateClick"
        >
          + New Project
        </Button>
      </div>

      <!-- Stats -->
      <div v-if="!isLoading && hasProjects" class="flex gap-6 text-sm text-muted-foreground">
        <span>
          Total: <strong class="text-foreground font-semibold">{{ projects?.length ?? 0 }}</strong>
        </span>
      </div>
    </div>

    <!-- Form (Create/Edit) -->
    <div v-if="isFormVisible" class="mb-8">
      <ProjectForm
        :project="editingProject"
        :is-loading="formLoading.value"
        @submit="handleFormSubmit"
        @cancel="handleFormCancel"
      />
    </div>

    <!-- Filters -->
    <ProjectFilters
      v-if="!isFormVisible && !isLoading && !error"
      v-model="filters"
      data-testid="project-filters"
    />

    <!-- Loading State -->
    <div
      v-if="isLoading"
      class="flex flex-col items-center justify-center py-16 gap-4"
      role="status"
      aria-live="polite"
    >
      <Loader2 class="h-10 w-10 animate-spin text-muted-foreground" aria-hidden="true" />
      <p class="text-muted-foreground">Loading projects...</p>
    </div>

    <!-- Error State -->
    <Alert v-else-if="error" variant="destructive" class="my-8">
      <AlertDescription class="flex flex-col items-center gap-4">
        <p class="text-lg">Failed to load projects</p>
        <Button variant="outline" @click="() => refetch()">
          Try Again
        </Button>
      </AlertDescription>
    </Alert>

    <!-- Empty State -->
    <div v-else-if="!hasProjects" class="text-center py-16">
      <FileText class="h-16 w-16 mx-auto mb-6 text-muted-foreground" />
      <h2 class="text-2xl font-semibold text-foreground mb-2">No projects found</h2>
      <p class="text-base text-muted-foreground mb-6">
        {{ filters.search || filters.status ? 'Try adjusting your filters' : 'Get started by creating your first project' }}
      </p>
      <Button
        v-if="!filters.search && !filters.status"
        @click="handleCreateClick"
      >
        Create Project
      </Button>
    </div>

    <!-- Projects Grid -->
    <div v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <ProjectCard
          v-for="project in projects"
          :key="project.uuid"
          :project="project"
          :is-deleting="isDeleting"
          data-testid="project-card"
          @edit="handleEditProject"
          @delete="handleDeleteProject"
          @click="handleProjectClick"
        />
      </div>

      <!-- Pagination -->
      <Pagination
        :current-page="currentPage"
        :total-pages="totalPages"
        :total-count="totalCount"
        :page-size="PAGE_SIZE"
        :is-loading="isLoading"
        @update:page="handlePageChange"
      />
    </div>
  </div>
</template>
