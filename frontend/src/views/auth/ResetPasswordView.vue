<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import ResetPasswordForm from '@/components/auth/ResetPasswordForm.vue'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

const router = useRouter()
const route = useRoute()

// Extract token from query params
const token = computed(() => {
  const tokenParam = route.query['token']
  return typeof tokenParam === 'string' ? tokenParam : ''
})

function handleSuccess(): void {
  // Redirect to login after successful password reset
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-linear-to-br from-purple-500 to-purple-700 p-4">
    <div class="bg-card rounded-lg shadow-xl w-full max-w-md">
      <!-- Show error if no token provided -->
      <div v-if="!token" class="p-8">
        <h2 class="text-2xl font-semibold mb-4 text-center">Invalid Reset Link</h2>
        <Alert variant="destructive" class="mb-6">
          <AlertDescription>
            This password reset link is invalid or has expired. Please request a new password reset.
          </AlertDescription>
        </Alert>
        <div class="text-center">
          <Button variant="outline" @click="router.push({ name: 'forgot-password' })">
            Request New Reset Link
          </Button>
        </div>
      </div>

      <!-- Show form if token is present -->
      <ResetPasswordForm
        v-else
        :token="token"
        @success="handleSuccess"
      />
    </div>
  </div>
</template>
