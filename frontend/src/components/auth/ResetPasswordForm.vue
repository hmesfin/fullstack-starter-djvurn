<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { passwordResetConfirmSchema } from '@/schemas'
import type { ZodIssue } from 'zod'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import PasswordInput from '@/components/PasswordInput.vue'

// Props
const props = defineProps<{
  token: string
}>()

// Emits
const emit = defineEmits<{
  success: []
}>()

// Composables
const { confirmPasswordReset, isConfirmingPasswordReset, passwordResetConfirmError } = useAuth()

// Form state
const password = ref('')
const confirmPassword = ref('')
const fieldErrors = ref<Record<string, string>>({})
const showSuccess = ref(false)

/**
 * Validate and submit password reset confirmation
 */
async function handleSubmit(): Promise<void> {
  // Clear previous errors
  fieldErrors.value = {}
  showSuccess.value = false

  // Check if passwords match
  if (password.value !== confirmPassword.value) {
    fieldErrors.value['confirmPassword'] = 'Passwords do not match'
    return
  }

  // Validate with Zod schema
  const result = passwordResetConfirmSchema.safeParse({
    token: props.token,
    password: password.value,
  })

  if (!result.success) {
    result.error.issues.forEach((issue: ZodIssue) => {
      const field = issue.path[0]
      if (field && typeof field === 'string') {
        fieldErrors.value[field] = issue.message
      }
    })
    return
  }

  // Submit password reset confirmation
  const { success } = await confirmPasswordReset(result.data)

  if (success) {
    showSuccess.value = true
    // Emit success after short delay to allow user to see message
    setTimeout(() => {
      emit('success')
    }, 2000)
  } else if (passwordResetConfirmError.value) {
    // Handle invalid/expired token error
    fieldErrors.value['token'] = passwordResetConfirmError.value.message
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
    <h2 class="text-2xl font-semibold mb-4 text-center">Reset Your Password</h2>

    <p class="mb-6 text-center text-muted-foreground text-sm leading-relaxed">
      Enter your new password below.
    </p>

    <!-- Success Message -->
    <Alert v-if="showSuccess" variant="default" class="mb-6">
      <AlertDescription>
        Password reset successful! Redirecting to login...
      </AlertDescription>
    </Alert>

    <!-- Invalid/Expired Token Error -->
    <Alert v-if="fieldErrors['token']" variant="destructive" class="mb-6">
      <AlertDescription>
        {{ fieldErrors['token'] }}
      </AlertDescription>
    </Alert>

    <form v-if="!showSuccess && !fieldErrors['token']" @submit.prevent="handleSubmit" novalidate class="space-y-4">
      <!-- Password Field -->
      <div class="space-y-2">
        <Label for="password">New Password</Label>
        <PasswordInput
          id="password"
          v-model="password"
          placeholder="Enter new password"
          autocomplete="new-password"
          :class="fieldErrors['password'] ? 'border-destructive' : ''"
          @input="clearFieldError('password')"
        />
        <p v-if="fieldErrors['password']" class="text-sm text-destructive">
          {{ fieldErrors['password'] }}
        </p>
        <p class="text-xs text-muted-foreground">
          Must be at least 8 characters with uppercase, lowercase, and number
        </p>
      </div>

      <!-- Confirm Password Field -->
      <div class="space-y-2">
        <Label for="confirmPassword">Confirm Password</Label>
        <PasswordInput
          id="confirmPassword"
          v-model="confirmPassword"
          placeholder="Confirm new password"
          autocomplete="new-password"
          :class="fieldErrors['confirmPassword'] ? 'border-destructive' : ''"
          @input="clearFieldError('confirmPassword')"
        />
        <p v-if="fieldErrors['confirmPassword']" class="text-sm text-destructive">
          {{ fieldErrors['confirmPassword'] }}
        </p>
      </div>

      <!-- General Error -->
      <Alert v-if="passwordResetConfirmError && !fieldErrors['token']" variant="destructive">
        <AlertDescription>
          {{ passwordResetConfirmError.message }}
        </AlertDescription>
      </Alert>

      <!-- Submit Button -->
      <Button
        type="submit"
        class="w-full"
        :disabled="isConfirmingPasswordReset || !password || !confirmPassword"
      >
        <span v-if="isConfirmingPasswordReset">Resetting Password...</span>
        <span v-else>Reset Password</span>
      </Button>
    </form>
  </div>
</template>
