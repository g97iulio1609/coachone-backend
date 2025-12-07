/**
 * Exercise Query Keys and Functions
 *
 * Standardized query keys and query functions for exercise-related queries
 */

import { exerciseApi } from '../exercise';
import type { ExerciseResponse, ExercisesResponse, ExerciseListParams } from '../exercise';

/**
 * Query keys for exercise queries
 */
export const exerciseKeys = {
  all: ['exercises'] as const,
  lists: () => [...exerciseKeys.all, 'list'] as const,
  list: (params?: ExerciseListParams) => [...exerciseKeys.lists(), params] as const,
  details: () => [...exerciseKeys.all, 'detail'] as const,
  detail: (id: string) => [...exerciseKeys.details(), id] as const,
} as const;

/**
 * Query functions for exercises
 */
export const exerciseQueries = {
  /**
   * Get all exercises with optional filters
   */
  list: (params?: ExerciseListParams): Promise<ExercisesResponse> => {
    return exerciseApi.list(params);
  },

  /**
   * Get exercise by ID
   */
  getById: (id: string): Promise<ExerciseResponse> => {
    return exerciseApi.getById(id);
  },
};
