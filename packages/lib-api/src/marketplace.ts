/**
 * Marketplace API Client
 *
 * API client for marketplace-related operations
 */

import { apiClient } from './client';

export interface MarketplacePlan {
  id: string;
  title: string;
  description: string;
  planType: 'WORKOUT' | 'NUTRITION';
  price: number;
  currency: string;
  coverImage?: string | null;
  coachId: string;
  coachName?: string;
  averageRating?: number;
  totalPurchases?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MarketplacePlansResponse {
  plans: MarketplacePlan[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface MarketplacePlanResponse {
  plan: MarketplacePlan;
}

export const marketplaceApi = {
  /**
   * Get all marketplace plans with filters
   */
  async getAll(filters?: {
    planType?: 'WORKOUT' | 'NUTRITION';
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    coachId?: string;
    searchQuery?: string;
    sortBy?: 'rating' | 'price' | 'recent' | 'popular';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }): Promise<MarketplacePlansResponse> {
    const params = new URLSearchParams();
    if (filters?.planType) params.append('planType', filters.planType);
    if (filters?.minPrice) params.append('minPrice', filters.minPrice.toString());
    if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
    if (filters?.minRating) params.append('minRating', filters.minRating.toString());
    if (filters?.coachId) params.append('coachId', filters.coachId);
    if (filters?.searchQuery) params.append('q', filters.searchQuery);
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const query = params.toString();
    return apiClient.get<MarketplacePlansResponse>(
      `/api/marketplace/plans${query ? `?${query}` : ''}`
    );
  },

  /**
   * Get marketplace plan by ID
   */
  async getById(id: string): Promise<MarketplacePlanResponse> {
    return apiClient.get<MarketplacePlanResponse>(`/api/marketplace/plans/${id}`);
  },
};
