<script setup lang="ts">
import { ref, computed } from 'vue'
import { EyeClosed, EyeIcon } from 'lucide-vue-next';
import { Input } from '@/components/ui/input'

// Props - extend standard input props
interface Props {
  id?: string
  modelValue?: string
  placeholder?: string
  autocomplete?: string
  class?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '••••••••',
  autocomplete: 'current-password',
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: string]
  input: [event: Event]
}>()

// Password visibility toggle
const showPassword = ref(false)

/**
 * Computed v-model for proper two-way binding
 */
const internalValue = computed({
  get: () => props.modelValue ?? '',
  set: (value: string) => emit('update:modelValue', value),
})

/**
 * Forward input event for form validation handlers
 */
function handleInput(event: Event): void {
  emit('input', event)
}

/**
 * Toggle password visibility
 */
function togglePasswordVisibility(): void {
  showPassword.value = !showPassword.value
}
</script>

<template>
  <div class="relative">
    <Input
      :id="id"
      v-model="internalValue"
      :type="showPassword ? 'text' : 'password'"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :class="props.class"
      :disabled="disabled"
      @input="handleInput"
    />
    <button
      type="button"
      class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
      :aria-label="showPassword ? 'Hide password' : 'Show password'"
      :disabled="disabled"
      @click="togglePasswordVisibility"
    >
      <EyeIcon v-if="showPassword" class="w-5 h-5" />
      <EyeClosed v-else class="w-5 h-5" />
    </button>
  </div>
</template>
