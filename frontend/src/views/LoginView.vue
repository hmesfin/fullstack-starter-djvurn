<script setup lang="ts">
import { useRouter } from 'vue-router'
import LoginForm from '@/components/auth/LoginForm.vue'

const router = useRouter()

function handleLoginSuccess(): void {
  router.push({ name: 'dashboard' })
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-purple-700 p-4">
    <div class="bg-card rounded-lg shadow-xl w-full max-w-md">
      <LoginForm @success="handleLoginSuccess" />
    </div>
  </div>
</template>
