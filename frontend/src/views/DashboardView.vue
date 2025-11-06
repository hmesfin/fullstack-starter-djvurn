<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import ProjectList from '@/components/projects/ProjectList.vue'

const router = useRouter()
const { logout, user } = useAuth()

function handleLogout(): void {
  logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="dashboard-view">
    <!-- Header with user info and logout -->
    <header class="dashboard-header">
      <div class="container">
        <div class="header-content">
          <h1 class="app-title">Project Manager</h1>

          <div class="user-menu">
            <span v-if="user" class="user-name">
              {{ user.first_name }} {{ user.last_name }}
            </span>
            <button class="btn btn-secondary btn-sm" @click="handleLogout">
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main content -->
    <main class="dashboard-main">
      <div class="container">
        <ProjectList />
      </div>
    </main>
  </div>
</template>

<style scoped>
.dashboard-view {
  min-height: 100vh;
  background: #f3f4f6;
}

.dashboard-header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 1rem 0;
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.app-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-name {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.btn {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-secondary {
  background-color: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background-color: #e5e7eb;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.8125rem;
}

.dashboard-main {
  padding: 2rem 0;
}
</style>
