<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
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
const { verifyOTP, isVerifyingOTP, otpError, resendOTP, isResendingOTP, resendOTPError } = useAuth()

// Form state
const code = ref('')
const codeError = ref<string>('')

// Resend state
const resendSuccess = ref(false)
const resendCooldown = ref(0)
const canResend = ref(true)

// Focus input on mount
const codeInput = ref<InstanceType<typeof Input> | null>(null)

onMounted(() => {
  // Access the native input element from the Shadcn Input component
  const inputElement = codeInput.value?.$el as HTMLInputElement | undefined
  inputElement?.focus()
})

// Watch code changes and format automatically
watch(code, (newValue, oldValue) => {
  const formatted = newValue.replace(/\D/g, '').slice(0, 6)
  if (formatted !== newValue) {
    code.value = formatted
  }
  // Clear error when user types
  if (codeError.value && newValue !== oldValue) {
    codeError.value = ''
  }
}, { flush: 'sync' })

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
 * Handle paste events to format pasted content
 */
function handlePaste(event: ClipboardEvent): void {
  event.preventDefault()
  const pastedText = event.clipboardData?.getData('text') || ''
  const numericOnly = pastedText.replace(/\D/g, '').slice(0, 6)
  code.value = numericOnly
}

/**
 * Go back to registration
 */
function handleBack(): void {
  emit('back')
}

/**
 * Resend OTP code
 */
async function handleResend(): Promise<void> {
  if (!canResend.value || isResendingOTP.value || resendCooldown.value > 0) {
    return
  }

  // Clear previous success/error states
  resendSuccess.value = false

  // Call resend API
  const { success } = await resendOTP({ email: props.email })

  if (success) {
    resendSuccess.value = true
    // Show success message for 5 seconds
    setTimeout(() => {
      resendSuccess.value = false
    }, 5000)

    // Start 60 second cooldown to prevent spam
    canResend.value = false
    resendCooldown.value = 60

    const interval = setInterval(() => {
      resendCooldown.value--
      if (resendCooldown.value <= 0) {
        clearInterval(interval)
        canResend.value = true
      }
    }, 1000)
  }
  // Error is handled by resendOTPError reactive state
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

    <!-- Resend Section -->
    <div class="mt-6 text-center">
      <!-- Success Message -->
      <Alert v-if="resendSuccess" variant="default" class="mb-4">
        <AlertDescription>
          Verification code resent successfully! Check your email.
        </AlertDescription>
      </Alert>

      <!-- Error Message -->
      <Alert v-if="resendOTPError && !resendSuccess" variant="destructive" class="mb-4">
        <AlertDescription>
          {{ resendOTPError.message }}
        </AlertDescription>
      </Alert>

      <p class="text-sm text-muted-foreground">
        Didn't receive the code?
        <button
          type="button"
          :disabled="!canResend || isResendingOTP || resendCooldown > 0"
          :class="{
            'text-primary hover:underline font-medium bg-transparent border-none cursor-pointer p-0': canResend && !isResendingOTP && resendCooldown === 0,
            'text-muted-foreground cursor-not-allowed bg-transparent border-none p-0': !canResend || isResendingOTP || resendCooldown > 0
          }"
          @click="handleResend"
        >
          <span v-if="isResendingOTP">Sending...</span>
          <span v-else-if="resendCooldown > 0">Resend code ({{ resendCooldown }}s)</span>
          <span v-else>Resend code</span>
        </button>
      </p>
    </div>
  </div>
</template>
