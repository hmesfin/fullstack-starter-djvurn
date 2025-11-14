<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { Button } from '@/components/ui/button'
import ThemeToggle from '@/components/ThemeToggle.vue'

const { isAuthenticated } = useAuth()
</script>

<template>
  <div class="min-h-screen flex flex-col bg-background">
    <!-- Navbar -->
    <header class="bg-card border-b border-border sticky top-0 z-50">
      <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <RouterLink :to="{ name: 'home' }" class="flex items-center gap-2">
            <span class="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 dark:from-purple-400 dark:to-purple-600 bg-clip-text text-transparent">
              djvurn
            </span>
          </RouterLink>

          <!-- Navigation Links -->
          <div class="hidden md:flex items-center gap-6">
            <RouterLink
              :to="{ name: 'home' }"
              class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Home
            </RouterLink>
            <!-- Add more nav links as needed -->
          </div>

          <!-- Right Side: Theme Toggle + Auth Buttons -->
          <div class="flex items-center gap-3">
            <ThemeToggle />

            <template v-if="isAuthenticated">
              <RouterLink :to="{ name: 'dashboard' }">
                <Button variant="default" size="sm">
                  Dashboard
                </Button>
              </RouterLink>
            </template>
            <template v-else>
              <RouterLink :to="{ name: 'login' }">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </RouterLink>
              <RouterLink :to="{ name: 'register' }">
                <Button variant="default" size="sm">
                  Sign Up
                </Button>
              </RouterLink>
            </template>
          </div>
        </div>
      </nav>
    </header>

    <!-- Main Content -->
    <main class="flex-1">
      <router-view />
    </main>

    <!-- Footer -->
    <footer class="bg-card border-t border-border mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- About -->
          <div>
            <h3 class="text-sm font-semibold mb-3">About</h3>
            <p class="text-sm text-muted-foreground">
              djvurn is a modern project management platform built with Django and Vue.js.
            </p>
          </div>

          <!-- Quick Links -->
          <div>
            <h3 class="text-sm font-semibold mb-3">Quick Links</h3>
            <ul class="space-y-2 text-sm text-muted-foreground">
              <li>
                <RouterLink :to="{ name: 'home' }" class="hover:text-foreground transition-colors">
                  Home
                </RouterLink>
              </li>
              <li v-if="!isAuthenticated">
                <RouterLink :to="{ name: 'login' }" class="hover:text-foreground transition-colors">
                  Login
                </RouterLink>
              </li>
              <li v-if="!isAuthenticated">
                <RouterLink :to="{ name: 'register' }" class="hover:text-foreground transition-colors">
                  Sign Up
                </RouterLink>
              </li>
            </ul>
          </div>

          <!-- Legal -->
          <div>
            <h3 class="text-sm font-semibold mb-3">Legal</h3>
            <ul class="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" class="hover:text-foreground transition-colors">Privacy Policy</a>
              </li>
              <li>
                <a href="#" class="hover:text-foreground transition-colors">Terms of Service</a>
              </li>
            </ul>
          </div>
        </div>

        <div class="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>&copy; {{ new Date().getFullYear() }} djvurn. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>
