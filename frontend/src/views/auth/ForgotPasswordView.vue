<script setup lang="ts">
import { useRouter } from 'vue-router'
import AuthLayout from '@/layouts/AuthLayout.vue'
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
  <AuthLayout>
    <ForgotPasswordForm
      @success="handleSuccess"
      @back="handleBack"
    />
  </AuthLayout>
</template>
