<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { Button } from '@/components/ui/button'
import ThemeToggle from '@/components/ThemeToggle.vue'
import ProjectList from '@/components/projects/ProjectList.vue'

const router = useRouter()
const { logout, user } = useAuth()

function handleLogout(): void {
  logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="min-h-screen bg-background">
    <!-- Header with user info and logout -->
    <header class="bg-card border-b border-border">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex justify-between items-center py-4">
          <h1 class="text-2xl font-bold text-foreground">Project Manager</h1>

          <div class="flex items-center gap-3">
            <ThemeToggle />
            <span v-if="user" class="text-sm text-muted-foreground font-medium">
              {{ user.first_name }} {{ user.last_name }}
            </span>
            <Button variant="secondary" size="sm" @click="handleLogout">
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main content -->
    <main class="py-8">
      <div class="max-w-7xl mx-auto px-4">
        <ProjectList />
      </div>
    </main>
  </div>
</template>
