<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthLayout from '@/layouts/AuthLayout.vue'
import LoginForm from '@/components/auth/LoginForm.vue'
import OTPVerificationForm from '@/components/auth/OTPVerificationForm.vue'

const router = useRouter()
const showOTPForm = ref(false)
const loginEmail = ref('')

function handleLoginSuccess(): void {
  router.push({ name: 'dashboard' })
}

function handleEmailVerificationRequired(email: string): void {
  // User tried to login with unverified email
  // Backend has already sent OTP email
  loginEmail.value = email
  showOTPForm.value = true
}

function handleOTPVerified(): void {
  // Email verified, redirect back to login
  showOTPForm.value = false
  loginEmail.value = ''
}

function handleBackToLogin(): void {
  showOTPForm.value = false
  loginEmail.value = ''
}
</script>

<template>
  <AuthLayout>
    <template v-if="!showOTPForm">
      <LoginForm
        @success="handleLoginSuccess"
        @email-verification-required="handleEmailVerificationRequired"
      />
    </template>
    <template v-else>
      <OTPVerificationForm
        :email="loginEmail"
        @success="handleOTPVerified"
        @back="handleBackToLogin"
      />
    </template>
  </AuthLayout>
</template>
