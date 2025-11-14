<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Zap, Shield, Users } from 'lucide-vue-next'

const { isAuthenticated } = useAuth()

const features = [
  {
    icon: Zap,
    title: 'Fast & Efficient',
    description: 'Built with modern technology stack for optimal performance and developer experience.',
  },
  {
    icon: Shield,
    title: 'Secure by Default',
    description: 'Email verification, JWT authentication, and comprehensive security measures built-in.',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Manage projects with your team, assign tasks, and track progress in real-time.',
  },
  {
    icon: CheckCircle2,
    title: 'Production Ready',
    description: 'Docker-first development, comprehensive testing, and deployment-ready configuration.',
  },
]
</script>

<template>
  <!-- Hero Section -->
  <section class="relative py-20 lg:py-32">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            <span class="block text-foreground">Modern Project</span>
            <span class="block bg-gradient-to-r from-purple-600 to-purple-800 dark:from-purple-400 dark:to-purple-600 bg-clip-text text-transparent">
              Management Platform
            </span>
          </h1>

          <p class="max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground mb-8">
            Built with Django, Vue.js, and TypeScript. A full-stack starter template with
            authentication, project management, and modern development practices.
          </p>

          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <template v-if="isAuthenticated">
              <RouterLink :to="{ name: 'dashboard' }">
                <Button size="lg" class="w-full sm:w-auto">
                  Go to Dashboard
                </Button>
              </RouterLink>
            </template>
            <template v-else>
              <RouterLink :to="{ name: 'register' }">
                <Button size="lg" class="w-full sm:w-auto">
                  Get Started
                </Button>
              </RouterLink>
              <RouterLink :to="{ name: 'login' }">
                <Button size="lg" variant="outline" class="w-full sm:w-auto">
                  Sign In
                </Button>
              </RouterLink>
            </template>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-20 bg-muted/50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl sm:text-4xl font-bold mb-4">
            Everything you need to get started
          </h2>
          <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
            A complete full-stack solution with best practices, security, and modern tooling.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div
            v-for="feature in features"
            :key="feature.title"
            class="bg-card rounded-lg p-6 border border-border hover:shadow-lg transition-shadow"
          >
            <div class="flex items-center justify-center w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/20 mb-4">
              <component :is="feature.icon" :size="24" class="text-purple-600 dark:text-purple-400" />
            </div>
            <h3 class="text-lg font-semibold mb-2">{{ feature.title }}</h3>
            <p class="text-sm text-muted-foreground">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl sm:text-4xl font-bold mb-4">
          Ready to get started?
        </h2>
        <p class="text-lg text-muted-foreground mb-8">
          Create your account today and start managing your projects more effectively.
        </p>
        <template v-if="!isAuthenticated">
          <RouterLink :to="{ name: 'register' }">
            <Button size="lg">
              Sign Up Now
            </Button>
          </RouterLink>
        </template>
      </div>
    </section>
</template>
