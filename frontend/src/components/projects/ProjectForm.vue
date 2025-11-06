<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { projectCreateSchema, projectPatchSchema, type StatusEnum, type PriorityEnum } from '@/schemas'
import type { Project } from '@/api/types.gen'
import type { ZodIssue } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { STATUS_OPTIONS, PRIORITY_OPTIONS } from '@/constants/projects'

// Props
const props = defineProps<{
  project?: Project | null
  isLoading?: boolean
}>()

// Emits
const emit = defineEmits<{
  submit: [data: Record<string, unknown>]
  cancel: []
}>()

// Determine if we're editing or creating
const isEditing = computed(() => !!props.project)

// Form state
const formData = ref({
  name: '',
  description: '',
  status: 'draft' as StatusEnum,
  priority: 2 as PriorityEnum,
  start_date: '',
  due_date: '',
})

// Field errors
const fieldErrors = ref<Record<string, string>>({})

/**
 * Initialize form with project data if editing
 */
onMounted(() => {
  if (props.project) {
    formData.value = {
      name: props.project.name,
      description: props.project.description || '',
      status: props.project.status || 'draft',
      priority: props.project.priority || 2,
      start_date: props.project.start_date || '',
      due_date: props.project.due_date || '',
    }
  }
})

/**
 * Validate form and submit
 */
function handleSubmit(): void {
  // Clear previous errors
  fieldErrors.value = {}

  // Choose schema based on mode
  const schema = isEditing.value ? projectPatchSchema : projectCreateSchema

  // Prepare data (convert empty strings to undefined for optional fields)
  const dataToValidate = {
    name: formData.value.name,
    description: formData.value.description || undefined,
    status: formData.value.status,
    priority: formData.value.priority,
    start_date: formData.value.start_date || null,
    due_date: formData.value.due_date || null,
  }

  // Validate with Zod schema
  const result = schema.safeParse(dataToValidate)

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

  // Emit submit event with validated data
  emit('submit', result.data)
}

/**
 * Clear error for a specific field on input
 */
function clearFieldError(field: string): void {
  delete fieldErrors.value[field]
}

/**
 * Cancel form
 */
function handleCancel(): void {
  emit('cancel')
}
</script>

<template>
  <div class="max-w-2xl mx-auto p-8 bg-card rounded-lg shadow">
    <h2 class="text-2xl font-semibold mb-6 text-foreground">
      {{ isEditing ? 'Edit Project' : 'Create New Project' }}
    </h2>

    <form @submit.prevent="handleSubmit" novalidate class="space-y-5">
      <!-- Project Name -->
      <div class="space-y-2">
        <Label for="name">
          Project Name <span class="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          v-model="formData.name"
          type="text"
          placeholder="Enter project name"
          :class="{ 'border-destructive': fieldErrors['name'] }"
          @input="clearFieldError('name')"
        />
        <p v-if="fieldErrors['name']" class="text-xs text-destructive">
          {{ fieldErrors['name'] }}
        </p>
      </div>

      <!-- Description -->
      <div class="space-y-2">
        <Label for="description">Description</Label>
        <Textarea
          id="description"
          v-model="formData.description"
          placeholder="Enter project description (optional)"
          rows="4"
          :class="{ 'border-destructive': fieldErrors['description'] }"
          @input="clearFieldError('description')"
        />
        <p v-if="fieldErrors['description']" class="text-xs text-destructive">
          {{ fieldErrors['description'] }}
        </p>
      </div>

      <!-- Status & Priority Row -->
      <div class="grid grid-cols-2 gap-4">
        <!-- Status -->
        <div class="space-y-2">
          <Label for="status">Status</Label>
          <Select v-model="formData.status">
            <SelectTrigger id="status" :class="{ 'border-destructive': fieldErrors['status'] }">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="option in STATUS_OPTIONS"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </SelectItem>
            </SelectContent>
          </Select>
          <p v-if="fieldErrors['status']" class="text-xs text-destructive">
            {{ fieldErrors['status'] }}
          </p>
        </div>

        <!-- Priority -->
        <div class="space-y-2">
          <Label for="priority">Priority</Label>
          <Select v-model="formData.priority">
            <SelectTrigger id="priority" :class="{ 'border-destructive': fieldErrors['priority'] }">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="option in PRIORITY_OPTIONS"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </SelectItem>
            </SelectContent>
          </Select>
          <p v-if="fieldErrors['priority']" class="text-xs text-destructive">
            {{ fieldErrors['priority'] }}
          </p>
        </div>
      </div>

      <!-- Dates Row -->
      <div class="grid grid-cols-2 gap-4">
        <!-- Start Date -->
        <div class="space-y-2">
          <Label for="start_date">Start Date</Label>
          <Input
            id="start_date"
            v-model="formData.start_date"
            type="date"
            :class="{ 'border-destructive': fieldErrors['start_date'] }"
            @input="clearFieldError('start_date')"
          />
          <p v-if="fieldErrors['start_date']" class="text-xs text-destructive">
            {{ fieldErrors['start_date'] }}
          </p>
        </div>

        <!-- Due Date -->
        <div class="space-y-2">
          <Label for="due_date">Due Date</Label>
          <Input
            id="due_date"
            v-model="formData.due_date"
            type="date"
            :class="{ 'border-destructive': fieldErrors['due_date'] }"
            @input="clearFieldError('due_date')"
          />
          <p v-if="fieldErrors['due_date']" class="text-xs text-destructive">
            {{ fieldErrors['due_date'] }}
          </p>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="flex gap-3 justify-end pt-6 border-t">
        <Button
          type="button"
          variant="secondary"
          :disabled="isLoading"
          @click="handleCancel"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          :disabled="isLoading"
        >
          <span v-if="isLoading">{{ isEditing ? 'Updating...' : 'Creating...' }}</span>
          <span v-else>{{ isEditing ? 'Update Project' : 'Create Project' }}</span>
        </Button>
      </div>
    </form>
  </div>
</template>
