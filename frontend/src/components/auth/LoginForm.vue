<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { emailTokenObtainPairSchema } from '@/schemas'
import type { ZodIssue } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'

// Emits
const emit = defineEmits<{
  success: []
  emailVerificationRequired: [email: string]
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
    // Check if email verification is required
    if ('email_verification_required' in loginError.value.details) {
      // Email verification required - emit event with email
      emit('emailVerificationRequired', formData.value.email)
      return
    }

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
  <div class="max-w-md mx-auto p-8">
    <h2 class="text-2xl font-semibold mb-6 text-center">Welcome Back</h2>
    <p class="mb-8 text-center text-muted-foreground">
      Sign in to your account to continue
    </p>

    <form @submit.prevent="handleSubmit" novalidate class="space-y-4">
      <!-- Email -->
      <div class="space-y-2">
        <Label for="email">Email</Label>
        <Input
          id="email"
          v-model="formData.email"
          type="email"
          placeholder="john@example.com"
          autocomplete="email"
          :class="{ 'border-destructive': fieldErrors['email'] }"
          @input="clearFieldError('email')"
        />
        <p v-if="fieldErrors['email']" class="text-sm text-destructive">
          {{ fieldErrors['email'] }}
        </p>
      </div>

      <!-- Password -->
      <div class="space-y-2">
        <Label for="password">Password</Label>
        <Input
          id="password"
          v-model="formData.password"
          type="password"
          placeholder="••••••••"
          autocomplete="current-password"
          :class="{ 'border-destructive': fieldErrors['password'] }"
          @input="clearFieldError('password')"
        />
        <p v-if="fieldErrors['password']" class="text-sm text-destructive">
          {{ fieldErrors['password'] }}
        </p>
      </div>

      <!-- Remember Me & Forgot Password -->
      <div class="flex items-center justify-between">
        <label class="flex items-center gap-2 text-sm cursor-pointer">
          <Checkbox
            v-model:checked="rememberMe"
            id="remember"
          />
          <span>Remember me</span>
        </label>
        <a href="/forgot-password" class="text-sm text-primary hover:underline font-medium">
          Forgot password?
        </a>
      </div>

      <!-- General Error -->
      <Alert v-if="loginError && !loginError.details" variant="destructive">
        <AlertDescription>
          {{ loginError.message }}
        </AlertDescription>
      </Alert>

      <!-- Submit Button -->
      <Button
        type="submit"
        class="w-full"
        :disabled="isLoggingIn"
      >
        <span v-if="isLoggingIn">Signing In...</span>
        <span v-else>Sign In</span>
      </Button>
    </form>

    <p class="mt-6 text-center text-sm text-muted-foreground">
      Don't have an account?
      <a href="/register" class="text-primary hover:underline font-medium">Sign up</a>
    </p>
  </div>
</template>
