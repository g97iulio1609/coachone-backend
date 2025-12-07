import { z } from 'zod';

export const ImportedTaskSchema: z.ZodType<ImportedTask> = z.lazy(() =>
  z.object({
    id: z.string().optional(),
    title: z.string().min(1),
    description: z.string().optional(),
    status: z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED', 'CANCELLED']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
    dueDate: z.string().datetime().optional(),
    tags: z.array(z.string()).optional(),
    subtasks: z.array(ImportedTaskSchema).optional(),
  })
);

export type ImportedTask = {
  id?: string;
  title: string;
  description?: string;
  status?: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED' | 'CANCELLED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  dueDate?: string;
  tags?: string[];
  subtasks?: ImportedTask[];
};

export const ImportedProjectSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'COMPLETED', 'ARCHIVED', 'ON_HOLD']).optional(),
  dueDate: z.string().datetime().optional(),
  color: z.string().optional(),
  tasks: z.array(ImportedTaskSchema).optional(),
});

export type ImportedProject = z.infer<typeof ImportedProjectSchema>;

export const ImportedHabitSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  frequency: z.enum(['DAILY', 'WEEKLY']).default('DAILY'),
  color: z.string().optional(),
});

export type ImportedHabit = z.infer<typeof ImportedHabitSchema>;

export const ImportedOneAgendaSchema = z.object({
  projects: z.array(ImportedProjectSchema).default([]),
  tasks: z.array(ImportedTaskSchema).default([]),
  habits: z.array(ImportedHabitSchema).default([]),
});

export type ImportedOneAgenda = z.infer<typeof ImportedOneAgendaSchema>;
