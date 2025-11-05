<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { otpVerificationSchema } from '@/schemas'

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
  <div class="otp-form">
    <h2 class="form-title">Verify Your Email</h2>

    <p class="form-description">
      We've sent a 6-digit code to <strong>{{ email }}</strong>. Please enter it below.
    </p>

    <form @submit.prevent="handleSubmit" novalidate>
      <!-- OTP Code -->
      <div class="form-group">
        <label for="code" class="form-label">Verification Code</label>
        <input
          id="code"
          ref="codeInput"
          v-model="code"
          type="text"
          inputmode="numeric"
          pattern="[0-9]*"
          class="form-input code-input"
          :class="{ 'input-error': codeError || otpError }"
          placeholder="123456"
          maxlength="6"
          autocomplete="one-time-code"
          @input="formatCode"
          @paste="handlePaste"
        />
        <p v-if="codeError" class="error-message">
          {{ codeError }}
        </p>
      </div>

      <!-- General Error -->
      <div v-if="otpError && !codeError" class="alert alert-error">
        {{ otpError.message }}
      </div>

      <!-- Action Buttons -->
      <div class="button-group">
        <button
          type="button"
          class="btn btn-secondary"
          :disabled="isVerifyingOTP"
          @click="handleBack"
        >
          Back
        </button>
        <button
          type="submit"
          class="btn btn-primary"
          :disabled="isVerifyingOTP || code.length !== 6"
        >
          <span v-if="isVerifyingOTP">Verifying...</span>
          <span v-else>Verify Email</span>
        </button>
      </div>
    </form>

    <p class="form-footer">
      Didn't receive the code?
      <button type="button" class="form-link-button">
        Resend code
      </button>
    </p>
  </div>
</template>

<style scoped>
.otp-form {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
}

.form-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  text-align: center;
}

.form-description {
  margin-bottom: 1.5rem;
  text-align: center;
  color: #6b7280;
  font-size: 0.875rem;
  line-height: 1.5;
}

.form-description strong {
  color: #111827;
  font-weight: 600;
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

.code-input {
  text-align: center;
  font-size: 1.5rem;
  letter-spacing: 0.5rem;
  font-weight: 600;
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

.button-group {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 0.75rem;
}

.btn {
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

.btn-secondary {
  background-color: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #e5e7eb;
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.form-footer {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.875rem;
  color: #6b7280;
}

.form-link-button {
  background: none;
  border: none;
  color: #3b82f6;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
  text-decoration: none;
}

.form-link-button:hover {
  text-decoration: underline;
}
</style>
