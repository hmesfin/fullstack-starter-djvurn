<!-- frontend/src/components/CreateProjectForm.vue -->
<template>
  <form @submit.prevent="handleSubmit">
    <div>
      <label for="name">Project Name</label>
      <input
        id="name"
        v-model="form.name"
        type="text"
        required
        :class="{ error: errors.name }"
      />
      <span v-if="errors.name" class="error-text">{{ errors.name }}</span>
    </div>

    <div>
      <label for="description">Description</label>
      <textarea
        id="description"
        v-model="form.description"
        :class="{ error: errors.description }"
      />
    </div>

    <div>
      <label for="status">Status</label>
      <select
        id="status"
        v-model="form.status"
        required
      >
        <option value="draft">Draft</option>
        <option value="active">Active</option>
        <option value="completed">Completed</option>
        <option value="archived">Archived</option>
      </select>
    </div>

    <div>
      <label for="priority">Priority</label>
      <select
        id="priority"
        v-model.number="form.priority"
        required
      >
        <option :value="1">Low</option>
        <option :value="2">Medium</option>
        <option :value="3">High</option>
        <option :value="4">Critical</option>
      </select>
    </div>

    <button type="submit" :disabled="isSubmitting">
      {{ isSubmitting ? 'Creating...' : 'Create Project' }}
    </button>
  </form>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { z } from 'zod';
import type { ProjectCreateRequest, StatusEnum, PriorityEnum } from '@/api/types.gen';

const emit = defineEmits<{
  submit: [data: ProjectCreateRequest]
}>();

// Use the generated types for the form
const form = reactive<ProjectCreateRequest>({
  name: '',
  description: '',
  status: 'draft' as StatusEnum,
  priority: 2 as PriorityEnum,
});

const errors = reactive<Partial<Record<keyof ProjectCreateRequest, string>>>({});
const isSubmitting = ref(false);

// Zod schema matching the generated types
const ProjectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().optional(),
  status: z.enum(['draft', 'active', 'completed', 'archived']),
  priority: z.number().min(1).max(4),
});

const handleSubmit = async () => {
  // Reset errors
  Object.keys(errors).forEach(key => delete errors[key as keyof typeof errors]);

  // Validate
  try {
    const validated = ProjectSchema.parse(form);
    isSubmitting.value = true;
    emit('submit', validated as ProjectCreateRequest);
  } catch (error) {
    if (error instanceof z.ZodError) {
      error.issues.forEach((err) => {
        const field = err.path[0] as keyof ProjectCreateRequest;
        errors[field] = err.message;
      });
    }
  } finally {
    isSubmitting.value = false;
  }
};
</script>
