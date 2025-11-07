<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthLayout from '@/layouts/AuthLayout.vue'
import RegisterForm from '@/components/auth/RegisterForm.vue'
import OTPVerificationForm from '@/components/auth/OTPVerificationForm.vue'

const router = useRouter()
const showOTPForm = ref(false)
const registeredEmail = ref('')

function handleRegisterSuccess(email: string): void {
  registeredEmail.value = email
  showOTPForm.value = true
}

function handleOTPVerified(): void {
  router.push({ name: 'login' })
}

function handleBackToRegister(): void {
  showOTPForm.value = false
}
</script>

<template>
  <AuthLayout>
    <template v-if="!showOTPForm">
      <RegisterForm @success="handleRegisterSuccess" />
    </template>
    <template v-else>
      <OTPVerificationForm
        :email="registeredEmail"
        @success="handleOTPVerified"
        @back="handleBackToRegister"
      />
    </template>
  </AuthLayout>
</template>
