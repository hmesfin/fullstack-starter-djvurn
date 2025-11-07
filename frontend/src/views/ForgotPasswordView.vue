<script setup lang="ts">
import { useRouter } from 'vue-router'
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm.vue'

const router = useRouter()

function handleSuccess(): void {
  // Stay on the same page - the form shows success message
  // User can click "Back to Login" button
}

function handleBack(): void {
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-purple-700 p-4">
    <div class="bg-card rounded-lg shadow-xl w-full max-w-md">
      <ForgotPasswordForm
        @success="handleSuccess"
        @back="handleBack"
      />
    </div>
  </div>
</template>
