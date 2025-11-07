<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
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
  <div class="auth-view">
    <div class="auth-container">
      <div v-if="!showOTPForm" class="auth-content">
        <div class="auth-header">
          <h1>Create Account</h1>
          <p>Sign up to get started</p>
        </div>

        <RegisterForm @success="handleRegisterSuccess" />

        <div class="auth-footer">
          <p>
            Already have an account?
            <router-link :to="{ name: 'login' }" class="auth-link">
              Sign in
            </router-link>
          </p>
        </div>
      </div>

      <div v-else class="auth-content">
        <OTPVerificationForm
          :email="registeredEmail"
          @success="handleOTPVerified"
          @back="handleBackToRegister"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

.auth-container {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  width: 100%;
  max-width: 400px;
}

.auth-content {
  width: 100%;
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-header h1 {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.auth-header p {
  color: #6b7280;
  font-size: 0.875rem;
}

.auth-footer {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.875rem;
  color: #6b7280;
}

.auth-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

.auth-link:hover {
  text-decoration: underline;
}
</style>
