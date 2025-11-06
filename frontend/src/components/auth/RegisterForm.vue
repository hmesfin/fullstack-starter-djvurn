<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { userRegistrationSchema } from '@/schemas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

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
  <div class="max-w-md mx-auto p-8">
    <h2 class="text-2xl font-semibold mb-6 text-center">Create Account</h2>

    <form @submit.prevent="handleSubmit" novalidate class="space-y-4">
      <!-- First Name -->
      <div class="space-y-2">
        <Label for="first_name">First Name</Label>
        <Input
          id="first_name"
          v-model="formData.first_name"
          type="text"
          placeholder="John"
          :class="{ 'border-destructive': fieldErrors['first_name'] }"
          @input="clearFieldError('first_name')"
        />
        <p v-if="fieldErrors['first_name']" class="text-sm text-destructive">
          {{ fieldErrors['first_name'] }}
        </p>
      </div>

      <!-- Last Name -->
      <div class="space-y-2">
        <Label for="last_name">Last Name</Label>
        <Input
          id="last_name"
          v-model="formData.last_name"
          type="text"
          placeholder="Doe"
          :class="{ 'border-destructive': fieldErrors['last_name'] }"
          @input="clearFieldError('last_name')"
        />
        <p v-if="fieldErrors['last_name']" class="text-sm text-destructive">
          {{ fieldErrors['last_name'] }}
        </p>
      </div>

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
          autocomplete="new-password"
          :class="{ 'border-destructive': fieldErrors['password'] }"
          @input="clearFieldError('password')"
        />
        <p v-if="fieldErrors['password']" class="text-sm text-destructive">
          {{ fieldErrors['password'] }}
        </p>
      </div>

      <!-- General Error -->
      <Alert v-if="registerError && !registerError.details" variant="destructive">
        <AlertDescription>
          {{ registerError.message }}
        </AlertDescription>
      </Alert>

      <!-- Submit Button -->
      <Button
        type="submit"
        class="w-full"
        :disabled="isRegistering"
        :aria-label="isRegistering ? 'Creating account' : 'Create Account'"
      >
        <span v-if="isRegistering">Creating Account...</span>
        <span v-else>Register</span>
      </Button>
    </form>

    <p class="mt-6 text-center text-sm text-muted-foreground">
      Already have an account?
      <a href="/login" class="text-primary hover:underline font-medium">Sign in</a>
    </p>
  </div>
</template>
