<!-- frontend/src/components/ProjectList.vue -->
<template>
  <div class="project-list">
    <div class="header">
      <h2>Projects</h2>
      <button @click="showCreateForm = true" :disabled="isCreating">
        Add Project
      </button>
    </div>

    <div v-if="isLoading">Loading projects...</div>

    <div v-else-if="error" class="error">
      Error: {{ error.message }}
    </div>

    <div v-else>
      <div class="stats">
        <p>Total: {{ totalCount }}</p>
        <p>Active: {{ activeProjects.length }}</p>
        <p>Overdue: {{ overdueProjects.length }}</p>
      </div>

      <ul class="projects">
        <li v-for="project in projects" :key="project.uuid">
          <div class="project-card">
            <h3>{{ project.name }}</h3>
            <p>{{ project.description }}</p>
            <span class="status" :class="project.status">
              {{ project.status }}
            </span>
            <span class="priority" :data-priority="project.priority">
              Priority: {{ project.priority }}
            </span>
            <button @click="handleDelete(project.uuid)" :disabled="isDeleting">
              Delete
            </button>
          </div>
        </li>
      </ul>
    </div>

    <!-- Create form modal -->
    <CreateProjectModal
      v-if="showCreateForm"
      @close="showCreateForm = false"
      @save="handleCreate"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useProjects } from '@/composables/useProjects';
import type { ProjectCreateRequest } from '@/api/types.gen';

const showCreateForm = ref(false);

const {
  projects,
  totalCount,
  activeProjects,
  overdueProjects,
  isLoading,
  error,
  createProject,
  deleteProject,
  isCreating,
  isDeleting,
} = useProjects();




const handleCreate = async (data: ProjectCreateRequest) => {
  createProject(data);
  showCreateForm.value = false;
};

const handleDelete = (uuid: string) => {
  if (confirm('Are you sure?')) {
    deleteProject(uuid);
  }
};
</script>

<style scoped>
.project-card {
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.status {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
}

.status.active {
  background: #10b981;
  color: white;
}

.status.completed {
  background: #6b7280;
  color: white;
}
</style>
