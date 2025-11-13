<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { Button } from '@/components/ui/button'
import ThemeToggle from '@/components/ThemeToggle.vue'
import {
  LayoutDashboard,
  FolderKanban,
  Settings,
  User,
  Menu,
  X,
} from 'lucide-vue-next'

const router = useRouter()
const { logout, user } = useAuth()
const sidebarOpen = ref(false)

function handleLogout(): void {
  logout()
  router.push({ name: 'login' })
}

function toggleSidebar(): void {
  sidebarOpen.value = !sidebarOpen.value
}

// Navigation items
const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, route: 'dashboard' },
  { name: 'Projects', icon: FolderKanban, route: 'dashboard' },
  { name: 'Profile', icon: User, route: 'profile' },
  { name: 'Settings', icon: Settings, route: 'dashboard' },
]
</script>

<template>
  <div class="min-h-screen bg-background flex">
    <!-- Mobile sidebar backdrop -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 bg-black/50 z-40 lg:hidden"
      @click="toggleSidebar"
    ></div>

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transition-transform duration-300 ease-in-out lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
      ]"
    >
      <div class="flex flex-col h-full">
        <!-- Sidebar Header -->
        <div class="flex items-center justify-between p-4 border-b border-border">
          <RouterLink :to="{ name: 'home' }" class="flex items-center gap-2">
            <span class="text-xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 dark:from-purple-400 dark:to-purple-600 bg-clip-text text-transparent">
              ProjectHub
            </span>
          </RouterLink>
          <button
            class="lg:hidden text-muted-foreground hover:text-foreground"
            @click="toggleSidebar"
          >
            <X :size="20" />
          </button>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 p-4 space-y-2">
          <RouterLink
            v-for="item in navItems"
            :key="item.route"
            :to="{ name: item.route }"
            class="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            active-class="bg-accent text-accent-foreground"
          >
            <component :is="item.icon" :size="18" />
            {{ item.name }}
          </RouterLink>
        </nav>

        <!-- Sidebar Footer -->
        <div class="p-4 border-t border-border">
          <div v-if="user" class="flex items-center gap-2 mb-2">
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium truncate">
                {{ user.first_name }} {{ user.last_name }}
              </p>
              <p class="text-xs text-muted-foreground truncate">
                {{ user.email }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Top Header -->
      <header class="bg-card border-b border-border sticky top-0 z-30">
        <div class="flex items-center justify-between px-4 lg:px-6 h-16">
          <!-- Mobile menu button -->
          <button
            class="lg:hidden text-muted-foreground hover:text-foreground"
            @click="toggleSidebar"
          >
            <Menu :size="20" />
          </button>

          <!-- Page Title (can be customized via slot) -->
          <h1 class="text-xl font-semibold text-foreground">
            <slot name="header">Dashboard</slot>
          </h1>

          <!-- Right Side Actions -->
          <div class="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="secondary" size="sm" @click="handleLogout">
              Logout
            </Button>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="flex-1 overflow-auto">
        <div class="p-4 lg:p-6">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>
