/**
 * Templates API
 *
 * API functions per workout and nutrition templates
 */

import { apiClient } from './client';

export interface TemplateResponse {
  template: unknown;
}

export interface TemplatesResponse {
  templates: unknown[];
}

export const templateApi = {
  /**
   * Get workout templates
   */
  async getWorkoutTemplates(): Promise<TemplatesResponse> {
    return apiClient.get<TemplatesResponse>('/api/workout-templates');
  },

  /**
   * Create workout template
   */
  async createWorkoutTemplate(data: unknown): Promise<TemplateResponse> {
    return apiClient.post<TemplateResponse>('/api/workout-templates', data);
  },

  /**
   * Update workout template
   */
  async updateWorkoutTemplate(id: string, data: unknown): Promise<TemplateResponse> {
    return apiClient.put<TemplateResponse>(`/api/workout-templates/${id}`, data);
  },

  /**
   * Delete workout template
   */
  async deleteWorkoutTemplate(id: string): Promise<void> {
    return apiClient.delete(`/api/workout-templates/${id}`);
  },

  /**
   * Get nutrition templates
   */
  async getNutritionTemplates(): Promise<TemplatesResponse> {
    return apiClient.get<TemplatesResponse>('/api/nutrition-templates');
  },

  /**
   * Create nutrition template
   */
  async createNutritionTemplate(data: unknown): Promise<TemplateResponse> {
    return apiClient.post<TemplateResponse>('/api/nutrition-templates', data);
  },

  /**
   * Update nutrition template
   */
  async updateNutritionTemplate(id: string, data: unknown): Promise<TemplateResponse> {
    return apiClient.put<TemplateResponse>(`/api/nutrition-templates/${id}`, data);
  },

  /**
   * Delete nutrition template
   */
  async deleteNutritionTemplate(id: string): Promise<void> {
    return apiClient.delete(`/api/nutrition-templates/${id}`);
  },
};
