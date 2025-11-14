<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { useUser } from '@/composables/useUser'
import { patchedUserRequestSchema } from '@/schemas'
import type { ZodIssue } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import PasswordChangeForm from '@/components/user/PasswordChangeForm.vue'

// Form data interface
interface ProfileFormData {
  first_name: string
  last_name: string
  email: string
}

// Field errors interface
interface ProfileFieldErrors {
  first_name?: string
  last_name?: string
  email?: string
  avatar?: string
}

// Composables
const authStore = useAuthStore()
const { updateProfile, isUpdatingProfile, profileUpdateError, resetProfileUpdateError } = useUser()

// Form state
const formData = ref<ProfileFormData>({
  first_name: authStore.user?.first_name || '',
  last_name: authStore.user?.last_name || '',
  email: authStore.user?.email || '',
})

// Avatar state
const selectedAvatar = ref<File | null>(null)
const avatarPreview = ref<string | null>(null)

// Field errors
const fieldErrors = ref<ProfileFieldErrors>({})

// Success message
const successMessage = ref<string | null>(null)

// Track if form has been submitted (to prevent showing errors before submission)
const hasSubmitted = ref(false)

/**
 * Computed user initials for avatar fallback
 */
const userInitials = computed(() => {
  const first = authStore.user?.first_name?.[0] || ''
  const last = authStore.user?.last_name?.[0] || ''
  return (first + last).toUpperCase()
})

/**
 * Computed avatar URL
 */
const avatarUrl = computed(() => {
  if (avatarPreview.value) return avatarPreview.value
  return authStore.user?.avatar || ''
})

/**
 * Watch for changes to authStore.user and update form data
 * This ensures form populates when user data loads (e.g., after page refresh)
 */
watch(
  () => authStore.user,
  (newUser) => {
    if (newUser) {
      formData.value = {
        first_name: newUser.first_name || '',
        last_name: newUser.last_name || '',
        email: newUser.email || '',
      }
    }
  },
  { immediate: true }
)

/**
 * Clear any stale errors when component mounts
 */
onMounted(() => {
  resetProfileUpdateError()
})

/**
 * Handle avatar file selection
 */
function handleAvatarChange(event: Event): void {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (file) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      fieldErrors.value.avatar = 'Please select a valid image file'
      return
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      fieldErrors.value.avatar = 'Image file size cannot exceed 5MB'
      return
    }

    selectedAvatar.value = file

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      avatarPreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)

    delete fieldErrors.value.avatar
  }
}

/**
 * Validate form and submit profile update
 */
async function handleSubmit(): Promise<void> {
  // Mark that form has been submitted
  hasSubmitted.value = true

  // Clear previous errors and success message
  fieldErrors.value = {}
  successMessage.value = null
  resetProfileUpdateError()

  // Prepare update data (only include changed fields)
  const updateData: {
    first_name?: string
    last_name?: string
    email?: string
    avatar?: File
  } = {}

  if (formData.value.first_name !== authStore.user?.first_name) {
    updateData.first_name = formData.value.first_name
  }
  if (formData.value.last_name !== authStore.user?.last_name) {
    updateData.last_name = formData.value.last_name
  }
  if (formData.value.email !== authStore.user?.email) {
    updateData.email = formData.value.email
  }
  if (selectedAvatar.value) {
    updateData.avatar = selectedAvatar.value
  }

  // Check if there are any changes
  if (Object.keys(updateData).length === 0) {
    successMessage.value = 'No changes to save'
    return
  }

  // Validate with Zod schema
  const result = patchedUserRequestSchema.safeParse(updateData)

  if (!result.success) {
    // Map Zod errors to field errors
    result.error.issues.forEach((issue: ZodIssue) => {
      const field = issue.path[0]
      if (field && typeof field === 'string') {
        fieldErrors.value[field as keyof ProfileFieldErrors] = issue.message
      }
    })
    return
  }

  try {
    // Submit profile update
    await updateProfile(result.data)
    successMessage.value = 'Profile updated successfully'
    selectedAvatar.value = null
    avatarPreview.value = null
  } catch {
    // Error is handled by useUser composable
    if (profileUpdateError?.details) {
      // Map API errors to field errors
      for (const [field, messages] of Object.entries(profileUpdateError.details)) {
        fieldErrors.value[field as keyof ProfileFieldErrors] = messages[0] ?? 'Invalid value'
      }
    }
  }
}

/**
 * Clear error for a specific field on input
 */
function clearFieldError(field: keyof ProfileFieldErrors): void {
  delete fieldErrors.value[field]
}

/**
 * Handle password change success
 */
function handlePasswordChangeSuccess(): void {
  // Could show a notification or message here if needed
}
</script>

<template>
  <div class="max-w-4xl mx-auto p-8">
    <h1 class="text-3xl font-bold mb-8">Profile Settings</h1>

    <div class="grid gap-6 md:grid-cols-2">
      <!-- Profile Information Card -->
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your personal information and avatar</CardDescription>
        </CardHeader>
        <CardContent>
          <form @submit.prevent="handleSubmit" novalidate class="space-y-4">
            <!-- Avatar Upload -->
            <div class="flex flex-col items-center space-y-4">
              <Avatar class="h-24 w-24">
                <AvatarImage :src="avatarUrl" :alt="userInitials" />
                <AvatarFallback>{{ userInitials }}</AvatarFallback>
              </Avatar>
              <div class="space-y-2 text-center">
                <Label for="avatar" class="cursor-pointer">
                  <Button type="button" variant="outline" size="sm">Change Avatar</Button>
                </Label>
                <input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="handleAvatarChange"
                />
                <p v-if="fieldErrors.avatar" class="text-sm text-destructive">
                  {{ fieldErrors.avatar }}
                </p>
                <p class="text-xs text-muted-foreground">JPG, PNG or GIF (max. 5MB)</p>
              </div>
            </div>

            <!-- First Name -->
            <div class="space-y-2">
              <Label for="first_name">First Name</Label>
              <Input
                id="first_name"
                v-model="formData.first_name"
                type="text"
                :class="{ 'border-destructive': fieldErrors.first_name }"
                @input="clearFieldError('first_name')"
              />
              <p v-if="fieldErrors.first_name" class="text-sm text-destructive">
                {{ fieldErrors.first_name }}
              </p>
            </div>

            <!-- Last Name -->
            <div class="space-y-2">
              <Label for="last_name">Last Name</Label>
              <Input
                id="last_name"
                v-model="formData.last_name"
                type="text"
                :class="{ 'border-destructive': fieldErrors.last_name }"
                @input="clearFieldError('last_name')"
              />
              <p v-if="fieldErrors.last_name" class="text-sm text-destructive">
                {{ fieldErrors.last_name }}
              </p>
            </div>

            <!-- Email -->
            <div class="space-y-2">
              <Label for="email">Email</Label>
              <Input
                id="email"
                v-model="formData.email"
                type="email"
                :class="{ 'border-destructive': fieldErrors.email }"
                @input="clearFieldError('email')"
              />
              <p v-if="fieldErrors.email" class="text-sm text-destructive">
                {{ fieldErrors.email }}
              </p>
            </div>

            <!-- General Error Alert -->
            <Alert v-if="hasSubmitted && profileUpdateError && !profileUpdateError.details" variant="destructive">
              <AlertDescription>{{ profileUpdateError.message }}</AlertDescription>
            </Alert>

            <!-- Success Alert -->
            <Alert v-if="successMessage" variant="default" class="border-green-500 bg-green-50">
              <AlertDescription class="text-green-800">{{ successMessage }}</AlertDescription>
            </Alert>

            <!-- Submit Button -->
            <Button type="submit" class="w-full" :disabled="isUpdatingProfile">
              {{ isUpdatingProfile ? 'Saving...' : 'Save Changes' }}
            </Button>
          </form>
        </CardContent>
      </Card>

      <!-- Password Change Card -->
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your password to keep your account secure</CardDescription>
        </CardHeader>
        <CardContent>
          <PasswordChangeForm @success="handlePasswordChangeSuccess" />
        </CardContent>
      </Card>
    </div>
  </div>
</template>
