<script setup lang="ts">
import { useRouter } from 'vue-router'
import LoginForm from '@/components/auth/LoginForm.vue'

const router = useRouter()

function handleLoginSuccess(): void {
  router.push({ name: 'dashboard' })
}
</script>

<template>
  <div class="auth-view">
    <div class="auth-container">
      <div class="auth-header">
        <h1>Welcome Back</h1>
        <p>Sign in to your account</p>
      </div>

      <LoginForm @success="handleLoginSuccess" />

      <div class="auth-footer">
        <p>
          Don't have an account?
          <router-link :to="{ name: 'register' }" class="auth-link">
            Sign up
          </router-link>
        </p>
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
