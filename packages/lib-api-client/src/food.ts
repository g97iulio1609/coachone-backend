/**
 * Food API
 *
 * API functions per food items
 */

import { apiClient } from './client';

export interface Food {
  id: string;
  name: string;
  nameNormalized?: string;
  barcode?: string;
  macrosPer100g: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber?: number;
  };
  servingSize: number;
  unit: string;
  imageUrl?: string;
  metadata?: {
    brand?: string;
    category?: string;
    [key: string]: unknown;
  };
  brand?: {
    id: string;
    name: string;
  };
  categories?: Array<{
    id: string;
    name: string;
    slug?: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

export interface FoodResponse {
  foodItem: Food;
}

export interface FoodsResponse {
  data: Food[];
  total?: number;
  page?: number;
  pageSize?: number;
}

export interface FoodListParams {
  search?: string;
  brandId?: string;
  categoryIds?: string[];
  barcode?: string;
  kcalMin?: number;
  kcalMax?: number;
  macroDominant?: 'protein' | 'carbs' | 'fats';
  minProteinPct?: number;
  minCarbPct?: number;
  minFatPct?: number;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const foodApi = {
  /**
   * Get all foods with optional filters
   */
  async list(params?: FoodListParams): Promise<FoodsResponse> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.brandId) searchParams.set('brandId', params.brandId);
    if (params?.categoryIds?.length) searchParams.set('categoryIds', params.categoryIds.join(','));
    if (params?.barcode) searchParams.set('barcode', params.barcode);
    if (params?.kcalMin !== undefined) searchParams.set('kcalMin', params.kcalMin.toString());
    if (params?.kcalMax !== undefined) searchParams.set('kcalMax', params.kcalMax.toString());
    if (params?.macroDominant) searchParams.set('macroDominant', params.macroDominant);
    if (params?.minProteinPct !== undefined)
      searchParams.set('minProteinPct', params.minProteinPct.toString());
    if (params?.minCarbPct !== undefined)
      searchParams.set('minCarbPct', params.minCarbPct.toString());
    if (params?.minFatPct !== undefined) searchParams.set('minFatPct', params.minFatPct.toString());
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.pageSize) searchParams.set('pageSize', params.pageSize.toString());
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);

    const query = searchParams.toString();
    return apiClient.get<FoodsResponse>(`/api/food${query ? `?${query}` : ''}`);
  },

  /**
   * Get food by ID
   */
  async getById(id: string): Promise<FoodResponse> {
    return apiClient.get<FoodResponse>(`/api/food/${id}`);
  },

  /**
   * Create food
   */
  async create(data: unknown): Promise<FoodResponse> {
    return apiClient.post<FoodResponse>('/api/food', data);
  },

  /**
   * Update food
   */
  async update(id: string, data: unknown): Promise<FoodResponse> {
    return apiClient.put<FoodResponse>(`/api/food/${id}`, data);
  },

  /**
   * Delete food
   */
  async delete(id: string): Promise<void> {
    return apiClient.delete(`/api/food/${id}`);
  },

  /**
   * Update food using AI
   */
  async updateWithAI(
    id: string,
    data: { description: string; customPrompt?: string }
  ): Promise<FoodResponse> {
    return apiClient.put<FoodResponse>(`/api/admin/foods/ai-update/${id}`, data);
  },

  /**
   * Batch operations (delete, update)
   */
  async batch(
    action: 'delete' | 'update',
    ids: string[],
    data?: Record<string, unknown>
  ): Promise<{
    success: boolean;
    results: Array<{ id: string; success: boolean; error?: string }>;
    deleted?: number;
    updated?: number;
  }> {
    return apiClient.post('/api/admin/foods/batch', { action, ids, data });
  },
};
