/**
 * Food Query Keys and Functions
 *
 * Standardized query keys and query functions for food-related queries
 */

import { foodApi } from '../food';
import type { FoodResponse, FoodsResponse, FoodListParams } from '../food';

/**
 * Query keys for food queries
 */
export const foodKeys = {
  all: ['foods'] as const,
  lists: () => [...foodKeys.all, 'list'] as const,
  list: (params?: FoodListParams) => [...foodKeys.lists(), params] as const,
  details: () => [...foodKeys.all, 'detail'] as const,
  detail: (id: string) => [...foodKeys.details(), id] as const,
} as const;

/**
 * Query functions for foods
 */
export const foodQueries = {
  /**
   * Get all foods with optional filters
   */
  list: (params?: FoodListParams): Promise<FoodsResponse> => {
    return foodApi.list(params);
  },

  /**
   * Get food by ID
   */
  getById: (id: string): Promise<FoodResponse> => {
    return foodApi.getById(id);
  },
};
