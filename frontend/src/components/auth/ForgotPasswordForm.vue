<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { passwordResetRequestSchema } from '@/schemas'
import type { ZodIssue } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

// Emits
const emit = defineEmits<{
  success: []
  back: []
}>()

// Composables
const { requestPasswordReset, isRequestingPasswordReset, passwordResetRequestError } = useAuth()

// Form state
const email = ref('')
const emailError = ref('')
const showSuccess = ref(false)

/**
 * Validate and submit password reset request
 */
async function handleSubmit(): Promise<void> {
  // Clear previous errors
  emailError.value = ''
  showSuccess.value = false

  // Validate with Zod schema
  const result = passwordResetRequestSchema.safeParse({ email: email.value })

  if (!result.success) {
    const emailIssue = result.error.issues.find((issue: ZodIssue) => issue.path[0] === 'email')
    if (emailIssue) {
      emailError.value = emailIssue.message
    }
    return
  }

  // Submit password reset request
  const { success } = await requestPasswordReset(result.data)

  if (success) {
    showSuccess.value = true
  } else if (passwordResetRequestError.value) {
    emailError.value = passwordResetRequestError.value.message
  }
}

/**
 * Clear email error on input
 */
function clearEmailError(): void {
  emailError.value = ''
}

/**
 * Go back to login
 */
function handleBack(): void {
  emit('back')
}
</script>

<template>
  <div class="max-w-md mx-auto p-8">
    <h2 class="text-2xl font-semibold mb-4 text-center">Forgot Password</h2>

    <p class="mb-6 text-center text-muted-foreground text-sm leading-relaxed">
      Enter your email address and we'll send you instructions to reset your password.
    </p>

    <!-- Success Message -->
    <Alert v-if="showSuccess" variant="default" class="mb-6">
      <AlertDescription>
        If an account exists with this email, you will receive password reset instructions.
        Please check your inbox.
      </AlertDescription>
    </Alert>

    <form v-if="!showSuccess" @submit.prevent="handleSubmit" novalidate class="space-y-4">
      <!-- Email Field -->
      <div class="space-y-2">
        <Label for="email">Email Address</Label>
        <Input
          id="email"
          v-model="email"
          type="email"
          placeholder="you@example.com"
          autocomplete="email"
          :class="{ 'border-destructive': emailError || passwordResetRequestError }"
          @input="clearEmailError"
        />
        <p v-if="emailError" class="text-sm text-destructive">
          {{ emailError }}
        </p>
      </div>

      <!-- General Error -->
      <Alert v-if="passwordResetRequestError && !emailError" variant="destructive">
        <AlertDescription>
          {{ passwordResetRequestError.message }}
        </AlertDescription>
      </Alert>

      <!-- Action Buttons -->
      <div class="grid grid-cols-[1fr_2fr] gap-3">
        <Button
          type="button"
          variant="secondary"
          :disabled="isRequestingPasswordReset"
          @click="handleBack"
        >
          Back
        </Button>
        <Button
          type="submit"
          :disabled="isRequestingPasswordReset || !email"
        >
          <span v-if="isRequestingPasswordReset">Sending...</span>
          <span v-else>Send Reset Link</span>
        </Button>
      </div>
    </form>

    <!-- Success state with back to login button -->
    <div v-if="showSuccess" class="mt-6 text-center">
      <Button variant="outline" @click="handleBack">
        Back to Login
      </Button>
    </div>
  </div>
</template>
