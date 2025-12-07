import type { z } from 'zod';

export const exerciseService: {
  create(
    data: unknown,
    options?: { userId?: string | null; autoApprove?: boolean }
  ): Promise<unknown>;
  update(
    id: string,
    data: unknown,
    options?: { userId?: string | null; locale?: string; includeTranslations?: boolean }
  ): Promise<unknown>;
  delete(id: string): Promise<{ id: string; slug?: string }>;
  getById(
    id: string,
    locale?: string,
    options?: { includeTranslations?: boolean; includeUnapproved?: boolean }
  ): Promise<unknown>;
  getBySlug(
    slug: string,
    locale?: string,
    options?: { includeTranslations?: boolean; includeUnapproved?: boolean }
  ): Promise<unknown>;
  list(options?: Record<string, unknown>): Promise<unknown>;
};

export const ExerciseAdminService: {
  import(
    items: Array<Record<string, unknown>>,
    options?: { userId?: string | null; mergeExisting?: boolean; autoApprove?: boolean }
  ): Promise<{ created?: unknown[]; existing?: unknown[]; errors?: unknown[] }>;
};

export const createExerciseSchema: z.ZodTypeAny;
export const updateExerciseSchema: z.ZodTypeAny;
export const exerciseQuerySchema: z.ZodTypeAny;
