/**
 * Dashboard Query Keys and Functions
 *
 * Standardized query keys and query functions for dashboard-related queries
 */

import { apiClient } from '../client';

/**
 * Dashboard stats response
 */
export interface DashboardStatsResponse {
  stats: {
    workoutsThisWeek: number;
    workoutsThisMonth: number;
    caloriesTrackedToday: number;
    currentStreak: number;
    weightChange30Days: number;
    totalVolumeThisMonth: number;
  };
}

/**
 * Dashboard activity item
 */
export interface DashboardActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  icon: string;
}

/**
 * Dashboard activity response
 */
export interface DashboardActivityResponse {
  activities: DashboardActivity[];
}

/**
 * Query keys for dashboard queries
 */
export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: () => [...dashboardKeys.all, 'stats'] as const,
  activity: () => [...dashboardKeys.all, 'activity'] as const,
} as const;

/**
 * Query functions for dashboard
 */
export const dashboardQueries = {
  /**
   * Get dashboard stats
   * Note: This endpoint may not exist yet, using a fallback
   */
  getStats: async (): Promise<DashboardStatsResponse> => {
    try {
      const response = await apiClient.get<DashboardStatsResponse>('/api/dashboard/stats');
      return response;
    } catch (error: unknown) {
      // Fallback to default stats if endpoint doesn't exist
      return {
        stats: {
          workoutsThisWeek: 0,
          workoutsThisMonth: 0,
          caloriesTrackedToday: 0,
          currentStreak: 0,
          weightChange30Days: 0,
          totalVolumeThisMonth: 0,
        },
      };
    }
  },

  /**
   * Get dashboard activity
   * Note: This endpoint may not exist yet, using a fallback
   */
  getActivity: async (): Promise<DashboardActivityResponse> => {
    try {
      const response = await apiClient.get<DashboardActivityResponse>('/api/dashboard/activity');
      return response;
    } catch (error: unknown) {
      // Fallback to empty activities if endpoint doesn't exist
      return { activities: [] };
    }
  },
};
