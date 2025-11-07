<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AuthLayout from '@/layouts/AuthLayout.vue'
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
  <AuthLayout>
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
  </AuthLayout>
</template>
