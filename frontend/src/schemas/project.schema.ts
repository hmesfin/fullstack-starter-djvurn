// frontend/src/schemas/project.schema.ts
import { z } from 'zod';

export const ProjectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().optional(),
  status: z.enum(['draft', 'active', 'completed', 'archived']),
  priority: z.number().min(1).max(4),
  start_date: z.string().optional(),
  due_date: z.string().optional(),
}).refine(
  (data) => {
    if (data.start_date && data.due_date) {
      return new Date(data.start_date) <= new Date(data.due_date);
    }
    return true;
  },
  {
    message: "Due date must be after start date",
    path: ["due_date"],
  }
);

export type ProjectFormData = z.infer<typeof ProjectSchema>;
