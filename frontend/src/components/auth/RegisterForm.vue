<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { userRegistrationSchema } from '@/schemas'

// Emits
const emit = defineEmits<{
  success: [email: string]
}>()

// Composables
const { register, isRegistering, registerError } = useAuth()

// Form state
const formData = ref({
  email: '',
  password: '',
  first_name: '',
  last_name: '',
})

// Field errors
const fieldErrors = ref<Record<string, string>>({})

/**
 * Validate form and submit registration
 */
async function handleSubmit(): Promise<void> {
  // Clear previous errors
  fieldErrors.value = {}

  // Validate with Zod schema
  const result = userRegistrationSchema.safeParse(formData.value)

  if (!result.success) {
    // Map Zod errors to field errors
    result.error.issues.forEach((issue) => {
      const field = issue.path[0]
      if (field && typeof field === 'string') {
        fieldErrors.value[field] = issue.message
      }
    })
    return
  }

  // Submit registration
  const { success, email } = await register(result.data)

  if (success && email) {
    // Emit success event to parent
    emit('success', email)
  } else if (registerError.value?.details) {
    // Map API errors to field errors
    for (const [field, messages] of Object.entries(registerError.value.details)) {
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
  <div class="register-form">
    <h2 class="form-title">Create Account</h2>

    <form @submit.prevent="handleSubmit" novalidate>
      <!-- First Name -->
      <div class="form-group">
        <label for="first_name" class="form-label">First Name</label>
        <input
          id="first_name"
          v-model="formData.first_name"
          type="text"
          class="form-input"
          :class="{ 'input-error': fieldErrors['first_name'] }"
          placeholder="John"
          @input="clearFieldError('first_name')"
        />
        <p v-if="fieldErrors['first_name']" class="error-message">
          {{ fieldErrors['first_name'] }}
        </p>
      </div>

      <!-- Last Name -->
      <div class="form-group">
        <label for="last_name" class="form-label">Last Name</label>
        <input
          id="last_name"
          v-model="formData.last_name"
          type="text"
          class="form-input"
          :class="{ 'input-error': fieldErrors['last_name'] }"
          placeholder="Doe"
          @input="clearFieldError('last_name')"
        />
        <p v-if="fieldErrors['last_name']" class="error-message">
          {{ fieldErrors['last_name'] }}
        </p>
      </div>

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
        <label for="password" class="form-label">Password</label>
        <input
          id="password"
          v-model="formData.password"
          type="password"
          class="form-input"
          :class="{ 'input-error': fieldErrors['password'] }"
          placeholder="••••••••"
          autocomplete="new-password"
          @input="clearFieldError('password')"
        />
        <p v-if="fieldErrors['password']" class="error-message">
          {{ fieldErrors['password'] }}
        </p>
      </div>

      <!-- General Error -->
      <div v-if="registerError && !registerError.details" class="alert alert-error">
        {{ registerError.message }}
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        class="btn btn-primary"
        :disabled="isRegistering"
        :aria-label="isRegistering ? 'Creating account' : 'Create Account'"
      >
        <span v-if="isRegistering">Creating Account...</span>
        <span v-else>Register</span>
      </button>
    </form>

    <p class="form-footer">
      Already have an account?
      <a href="/login" class="form-link">Sign in</a>
    </p>
  </div>
</template>

<style scoped>
.register-form {
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
}

.form-link:hover {
  text-decoration: underline;
}
</style>
