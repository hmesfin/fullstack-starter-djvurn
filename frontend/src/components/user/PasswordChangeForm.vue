<script setup lang="ts">
import { ref } from 'vue'
import { useUser } from '@/composables/useUser'
import { passwordChangeRequestSchema } from '@/schemas'
import type { ZodIssue } from 'zod'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import PasswordInput from '@/components/PasswordInput.vue'

// Emits
const emit = defineEmits<{
  success: []
}>()

// Composables
const { changePassword, isChangingPassword, passwordChangeError, resetPasswordChangeError } =
  useUser()

// Form state
const formData = ref({
  old_password: '',
  new_password: '',
})

// Confirmation password (not sent to API, only for UI validation)
const confirmPassword = ref('')

// Field errors
const fieldErrors = ref<Record<string, string>>({})

// Success message
const successMessage = ref<string | null>(null)

/**
 * Validate form and submit password change
 */
async function handleSubmit(): Promise<void> {
  // Clear previous errors and success message
  fieldErrors.value = {}
  successMessage.value = null
  resetPasswordChangeError()

  // Check if new password matches confirmation
  if (formData.value.new_password !== confirmPassword.value) {
    fieldErrors.value.confirmPassword = 'Passwords do not match'
    return
  }

  // Validate with Zod schema
  const result = passwordChangeRequestSchema.safeParse(formData.value)

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

  try {
    // Submit password change
    await changePassword(result.data)
    successMessage.value = 'Password changed successfully'

    // Clear form
    formData.value = {
      old_password: '',
      new_password: '',
    }
    confirmPassword.value = ''

    // Emit success event
    emit('success')
  } catch {
    // Error is handled by useUser composable
    if (passwordChangeError.value?.details) {
      // Map API errors to field errors
      for (const [field, messages] of Object.entries(passwordChangeError.value.details)) {
        fieldErrors.value[field] = messages[0] ?? 'Invalid value'
      }
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
  <form @submit.prevent="handleSubmit" novalidate class="space-y-4">
    <!-- Old Password -->
    <div class="space-y-2">
      <Label for="old_password">Current Password</Label>
      <PasswordInput
        id="old_password"
        v-model="formData.old_password"
        placeholder="Enter your current password"
        :class="{ 'border-destructive': fieldErrors.old_password }"
        @input="clearFieldError('old_password')"
      />
      <p v-if="fieldErrors.old_password" class="text-sm text-destructive">
        {{ fieldErrors.old_password }}
      </p>
    </div>

    <!-- New Password -->
    <div class="space-y-2">
      <Label for="new_password">New Password</Label>
      <PasswordInput
        id="new_password"
        v-model="formData.new_password"
        placeholder="Enter your new password (min 8 characters)"
        :class="{ 'border-destructive': fieldErrors.new_password }"
        @input="clearFieldError('new_password')"
      />
      <p v-if="fieldErrors.new_password" class="text-sm text-destructive">
        {{ fieldErrors.new_password }}
      </p>
      <p class="text-xs text-muted-foreground">
        Password must be at least 8 characters long
      </p>
    </div>

    <!-- Confirm New Password -->
    <div class="space-y-2">
      <Label for="confirm_password">Confirm New Password</Label>
      <PasswordInput
        id="confirm_password"
        v-model="confirmPassword"
        placeholder="Confirm your new password"
        :class="{ 'border-destructive': fieldErrors.confirmPassword }"
        @input="clearFieldError('confirmPassword')"
      />
      <p v-if="fieldErrors.confirmPassword" class="text-sm text-destructive">
        {{ fieldErrors.confirmPassword }}
      </p>
    </div>

    <!-- General Error Alert -->
    <Alert v-if="passwordChangeError && !passwordChangeError.details" variant="destructive">
      <AlertDescription>{{ passwordChangeError.message }}</AlertDescription>
    </Alert>

    <!-- Success Alert -->
    <Alert v-if="successMessage" variant="default" class="border-green-500 bg-green-50">
      <AlertDescription class="text-green-800">{{ successMessage }}</AlertDescription>
    </Alert>

    <!-- Submit Button -->
    <Button type="submit" class="w-full" :disabled="isChangingPassword">
      {{ isChangingPassword ? 'Changing Password...' : 'Change Password' }}
    </Button>
  </form>
</template>
