<script setup lang="ts">
import { ref, computed } from 'vue'
import { useProjects } from '@/composables/useProjects'
import ProjectCard from './ProjectCard.vue'
import ProjectFilters from './ProjectFilters.vue'
import ProjectForm from './ProjectForm.vue'
import type { Project } from '@/api/types.gen'

// State
const filters = ref<{
  status?: 'draft' | 'active' | 'completed' | 'archived'
  search?: string
  ordering?: string
}>({
  ordering: '-created_at',
})

const showCreateForm = ref(false)
const editingProject = ref<Project | null>(null)

// Use projects composable (pass ref value, not ref itself)
const {
  projects,
  isLoading,
  error,
  createProject,
  updateProject,
  deleteProject,
  isCreating,
  isUpdating,
  isDeleting,
  refetch,
} = useProjects(filters.value)

// Computed
const hasProjects = computed(() => (projects.value?.length ?? 0) > 0)
const isFormVisible = computed(() => showCreateForm.value || editingProject.value !== null)
const formLoading = computed(() => isCreating || isUpdating)

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
  // Navigate to project detail view
  console.log('Navigate to project:', project.uuid)
  // You can emit this event or use Vue Router here
}
</script>

<template>
  <div class="project-list-container">
    <!-- Header -->
    <div class="list-header">
      <div class="header-content">
        <h1 class="page-title">Projects</h1>
        <button
          v-if="!isFormVisible"
          class="btn btn-primary"
          @click="handleCreateClick"
        >
          + New Project
        </button>
      </div>

      <!-- Stats -->
      <div v-if="!isLoading && hasProjects" class="stats">
        <span class="stat-item">
          Total: <strong>{{ projects?.length ?? 0 }}</strong>
        </span>
      </div>
    </div>

    <!-- Form (Create/Edit) -->
    <div v-if="isFormVisible" class="form-container">
      <ProjectForm
        :project="editingProject"
        :is-loading="formLoading.value"
        @submit="handleFormSubmit"
        @cancel="handleFormCancel"
      />
    </div>

    <!-- Filters -->
    <ProjectFilters
      v-if="!isFormVisible"
      v-model="filters"
    />

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner" />
      <p>Loading projects...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <p class="error-message">Failed to load projects</p>
      <button class="btn btn-secondary" @click="() => refetch()">
        Try Again
      </button>
    </div>
    <!-- Empty State -->
    <div v-else-if="!hasProjects" class="empty-state">
      <svg
        class="empty-icon"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      <h2 class="empty-title">No projects found</h2>
      <p class="empty-description">
        {{ filters.search || filters.status ? 'Try adjusting your filters' : 'Get started by creating your first project' }}
      </p>
      <button
        v-if="!filters.search && !filters.status"
        class="btn btn-primary"
        @click="handleCreateClick"
      >
        Create Project
      </button>
    </div>

    <!-- Projects Grid -->
    <div v-else class="projects-grid">
      <ProjectCard
        v-for="project in projects"
        :key="project.uuid"
        :project="project"
        :is-deleting="isDeleting"
        @edit="handleEditProject"
        @delete="handleDeleteProject"
        @click="handleProjectClick"
      />
    </div>
  </div>
</template>

<style scoped>
.project-list-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.list-header {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.stats {
  display: flex;
  gap: 1.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.stat-item strong {
  color: #111827;
  font-weight: 600;
}

.form-container {
  margin-bottom: 2rem;
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

.btn-primary:hover {
  background-color: #2563eb;
}

.btn-secondary {
  background-color: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background-color: #e5e7eb;
}

.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: #6b7280;
}

.spinner {
  width: 2.5rem;
  height: 2.5rem;
  border: 3px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-state {
  color: #991b1b;
}

.error-message {
  font-size: 1.125rem;
  margin-bottom: 1rem;
}

.empty-icon {
  width: 4rem;
  height: 4rem;
  margin: 0 auto 1.5rem;
  color: #d1d5db;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.5rem;
}

.empty-description {
  font-size: 1rem;
  color: #6b7280;
  margin-bottom: 1.5rem;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

/* Responsive */
@media (max-width: 768px) {
  .project-list-container {
    padding: 1rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .projects-grid {
    grid-template-columns: 1fr;
  }
}
</style>
