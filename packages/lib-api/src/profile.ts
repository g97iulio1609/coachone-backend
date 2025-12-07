/**
 * Profile API
 *
 * API functions per user profile data
 */

import { apiClient } from './client';

export interface OneRepMaxResponse {
  maxes: unknown[];
}

export const profileApi = {
  /**
   * Get user one rep maxes
   */
  async getOneRepMaxes(): Promise<OneRepMaxResponse> {
    return apiClient.get<OneRepMaxResponse>('/api/profile/maxes');
  },

  /**
   * Upsert one rep max
   */
  async upsertOneRepMax(data: unknown): Promise<{ max: unknown }> {
    return apiClient.post<{ max: unknown }>('/api/profile/maxes', data);
  },

  /**
   * Delete one rep max
   */
  async deleteOneRepMax(exerciseId: string): Promise<void> {
    return apiClient.delete(`/api/profile/maxes/${exerciseId}`);
  },
};
