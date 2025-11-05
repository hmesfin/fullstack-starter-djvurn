<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { emailTokenObtainPairSchema } from '@/schemas'
import type { ZodIssue } from 'zod'

// Emits
const emit = defineEmits<{
  success: []
}>()

// Composables
const { login, isLoggingIn, loginError } = useAuth()

// Form state
const formData = ref({
  email: '',
  password: '',
})

// Field errors
const fieldErrors = ref<Record<string, string>>({})

// Remember me (for future implementation)
const rememberMe = ref(false)

/**
 * Validate form and submit login
 */
async function handleSubmit(): Promise<void> {
  // Clear previous errors
  fieldErrors.value = {}

  // Validate with Zod schema
  const result = emailTokenObtainPairSchema.safeParse(formData.value)

  if (!result.success) {
    // Map Zod errors to field errors
    result.error.issues.forEach((issue: ZodIssue) => {
      const field = issue.path[0]
      if (field && typeof field === 'string') {
        fieldErrors.value[field] = issue.message
      }
    })
    return
  }

  // Submit login
  const { success } = await login(result.data)

  if (success) {
    // Emit success event to parent
    emit('success')
  } else if (loginError.value?.details) {
    // Map API errors to field errors
    for (const [field, messages] of Object.entries(loginError.value.details)) {
      fieldErrors.value[field] = messages[0] ?? 'Invalid value'
    }
  }
}

/**
 * Clear error for a specific field on input
 */
function clearFieldError(field: string): void {
  delete fieldErrors.value[field]
}
</script>

<template>
  <div class="login-form">
    <h2 class="form-title">Welcome Back</h2>

    <form @submit.prevent="handleSubmit" novalidate>
      <!-- Email -->
      <div class="form-group">
        <label for="email" class="form-label">Email</label>
        <input
          id="email"
          v-model="formData.email"
          type="email"
          class="form-input"
          :class="{ 'input-error': fieldErrors['email'] }"
          placeholder="john@example.com"
          autocomplete="email"
          @input="clearFieldError('email')"
        />
        <p v-if="fieldErrors['email']" class="error-message">
          {{ fieldErrors['email'] }}
        </p>
      </div>

      <!-- Password -->
      <div class="form-group">
        <label for="password" class="form-label">
          Password
        </label>
        <input
          id="password"
          v-model="formData.password"
          type="password"
          class="form-input"
          :class="{ 'input-error': fieldErrors['password'] }"
          placeholder="••••••••"
          autocomplete="current-password"
          @input="clearFieldError('password')"
        />
        <p v-if="fieldErrors['password']" class="error-message">
          {{ fieldErrors['password'] }}
        </p>
      </div>

      <!-- Remember Me & Forgot Password -->
      <div class="form-options">
        <label class="checkbox-label">
          <input
            v-model="rememberMe"
            type="checkbox"
            class="checkbox-input"
          />
          <span>Remember me</span>
        </label>
        <a href="/forgot-password" class="form-link">
          Forgot password?
        </a>
      </div>

      <!-- General Error -->
      <div v-if="loginError && !loginError.details" class="alert alert-error">
        {{ loginError.message }}
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        class="btn btn-primary"
        :disabled="isLoggingIn"
      >
        <span v-if="isLoggingIn">Signing In...</span>
        <span v-else>Sign In</span>
      </button>
    </form>

    <p class="form-footer">
      Don't have an account?
      <a href="/register" class="form-link">Sign up</a>
    </p>
  </div>
</template>

<style scoped>
.login-form {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
}

.form-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  text-align: center;
}

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.input-error {
  border-color: #ef4444;
}

.input-error:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.error-message {
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #ef4444;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;
}

.checkbox-input {
  width: 1rem;
  height: 1rem;
  cursor: pointer;
}

.alert {
  padding: 0.75rem;
  border-radius: 0.375rem;
  margin-bottom: 1rem;
}

.alert-error {
  background-color: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.btn {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  font-weight: 500;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2563eb;
}

.btn-primary:disabled {
  background-color: #93c5fd;
  cursor: not-allowed;
}

.form-footer {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.875rem;
  color: #6b7280;
}

.form-link {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.875rem;
}

.form-link:hover {
  text-decoration: underline;
}
</style>
