import type { z } from 'zod';

export const foodService: {
  createFood(data: unknown): Promise<unknown>;
  updateFood(id: string, data: unknown): Promise<unknown>;
  getFoodById(id: string): Promise<unknown>;
  getFoodsByIds(ids: string[]): Promise<unknown>;
  searchFoods(
    query: string,
    options?: { limit?: number; page?: number; locale?: string }
  ): Promise<unknown>;
  list(options?: { page?: number; pageSize?: number; locale?: string }): Promise<unknown>;
};

export const foodImportSchema: z.ZodTypeAny;

export const FoodAdminService: {
  import(
    items: Array<unknown>,
    options?: { userId?: string | null; mergeExisting?: boolean }
  ): Promise<{ created?: unknown[]; existing?: unknown[]; errors?: unknown[] }>;
};
