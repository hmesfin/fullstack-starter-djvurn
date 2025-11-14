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
  <ForgotPasswordForm
    @success="handleSuccess"
    @back="handleBack"
  />
</template>
