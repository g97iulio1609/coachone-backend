/**
 * Coach API Client
 *
 * API client for coach-related operations
 */

import { apiClient } from './client';

export interface CoachProfile {
  id: string;
  userId: string;
  bio?: string | null;
  credentials?: string[] | null;
  coachingStyle?: string | null;
  linkedinUrl?: string | null;
  instagramUrl?: string | null;
  websiteUrl?: string | null;
  isPubliclyVisible: boolean;
  verificationStatus: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PublicCoachProfile extends CoachProfile {
  stats?: {
    totalPlans: number;
    totalSales: number;
    averageRating: number;
  };
}

export interface CoachProfileResponse {
  profile: CoachProfile;
}

export interface PublicCoachProfileResponse {
  profile: PublicCoachProfile;
  plans: unknown[];
  totalPlans: number;
}

export const coachApi = {
  /**
   * Get coach profile (current user's profile)
   */
  async getProfile(): Promise<CoachProfileResponse> {
    return apiClient.get<CoachProfileResponse>(`/api/coach/profile`);
  },

  /**
   * Get public coach profile
   */
  async getPublicProfile(userId: string): Promise<PublicCoachProfileResponse> {
    return apiClient.get<PublicCoachProfileResponse>(`/api/coach/public/${userId}`);
  },

  /**
   * Create coach profile
   */
  async createProfile(data: Partial<CoachProfile>): Promise<CoachProfileResponse> {
    return apiClient.post<CoachProfileResponse>('/api/coach/profile', data);
  },

  /**
   * Update coach profile
   */
  async updateProfile(data: Partial<CoachProfile>): Promise<CoachProfileResponse> {
    return apiClient.put<CoachProfileResponse>('/api/coach/profile', data);
  },
};
