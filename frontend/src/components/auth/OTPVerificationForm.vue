<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { otpVerificationSchema } from '@/schemas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

// Props
const props = defineProps<{
  email: string
}>()

// Emits
const emit = defineEmits<{
  success: []
  back: []
}>()

// Composables
const { verifyOTP, isVerifyingOTP, otpError } = useAuth()

// Form state
const code = ref('')
const codeError = ref<string>('')

// Focus input on mount
const codeInput = ref<HTMLInputElement | null>(null)

onMounted(() => {
  codeInput.value?.focus()
})

/**
 * Validate and submit OTP verification
 */
async function handleSubmit(): Promise<void> {
  // Clear previous error
  codeError.value = ''

  // Validate with Zod schema
  const result = otpVerificationSchema.safeParse({
    email: props.email,
    code: code.value,
  })

  if (!result.success) {
    const codeIssue = result.error.issues.find((issue) => issue.path[0] === 'code')
    if (codeIssue) {
      codeError.value = codeIssue.message
    }
    return
  }

  // Submit verification
  const { success } = await verifyOTP(result.data)

  if (success) {
    // Emit success event to parent
    emit('success')
  } else if (otpError.value) {
    codeError.value = otpError.value.message
  }
}

/**
 * Clear error on input
 */
function clearError(): void {
  codeError.value = ''
}

/**
 * Format code input (only numbers, max 6 digits)
 */
function formatCode(): void {
  code.value = code.value.replace(/\D/g, '').slice(0, 6)
  clearError()
}

/**
 * Handle paste events to format pasted content
 */
function handlePaste(event: ClipboardEvent): void {
  event.preventDefault()
  const pastedText = event.clipboardData?.getData('text') || ''
  const numericOnly = pastedText.replace(/\D/g, '').slice(0, 6)
  code.value = numericOnly
  clearError()
}

/**
 * Go back to registration
 */
function handleBack(): void {
  emit('back')
}
</script>

<template>
  <div class="max-w-md mx-auto p-8">
    <h2 class="text-2xl font-semibold mb-4 text-center">Verify Your Email</h2>

    <p class="mb-6 text-center text-muted-foreground text-sm leading-relaxed">
      We've sent a 6-digit code to <strong class="text-foreground font-semibold">{{ email }}</strong>. Please enter it below.
    </p>

    <form @submit.prevent="handleSubmit" novalidate class="space-y-4">
      <!-- OTP Code -->
      <div class="space-y-2">
        <Label for="code">Verification Code</Label>
        <Input
          id="code"
          ref="codeInput"
          v-model="code"
          type="text"
          inputmode="numeric"
          pattern="[0-9]*"
          class="text-center text-2xl tracking-[0.5rem] font-semibold"
          :class="{ 'border-destructive': codeError || otpError }"
          placeholder="123456"
          maxlength="6"
          autocomplete="one-time-code"
          @input="formatCode"
          @paste="handlePaste"
        />
        <p v-if="codeError" class="text-sm text-destructive">
          {{ codeError }}
        </p>
      </div>

      <!-- General Error -->
      <Alert v-if="otpError && !codeError" variant="destructive">
        <AlertDescription>
          {{ otpError.message }}
        </AlertDescription>
      </Alert>

      <!-- Action Buttons -->
      <div class="grid grid-cols-[1fr_2fr] gap-3">
        <Button
          type="button"
          variant="secondary"
          :disabled="isVerifyingOTP"
          @click="handleBack"
        >
          Back
        </Button>
        <Button
          type="submit"
          :disabled="isVerifyingOTP || code.length !== 6"
        >
          <span v-if="isVerifyingOTP">Verifying...</span>
          <span v-else>Verify Email</span>
        </Button>
      </div>
    </form>

    <p class="mt-6 text-center text-sm text-muted-foreground">
      Didn't receive the code?
      <button type="button" class="text-primary hover:underline font-medium bg-transparent border-none cursor-pointer p-0">
        Resend code
      </button>
    </p>
  </div>
</template>
