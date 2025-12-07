/**
 * Analytics API
 *
 * API functions per analytics data
 */

import { apiClient } from './client';

export interface AnalyticsOverviewParams {
  startDate?: string;
  endDate?: string;
  period?: '7d' | '30d' | '90d' | '1y';
}

export interface AnalyticsOverviewResponse {
  report: unknown;
}

export interface ChartDataParams {
  type: string;
  startDate?: string;
  endDate?: string;
  period?: string;
}

export const analyticsApi = {
  /**
   * Get analytics overview
   */
  async getOverview(params?: AnalyticsOverviewParams): Promise<AnalyticsOverviewResponse> {
    const searchParams = new URLSearchParams();
    if (params?.startDate) searchParams.set('startDate', params.startDate);
    if (params?.endDate) searchParams.set('endDate', params.endDate);
    if (params?.period) searchParams.set('period', params.period);

    const query = searchParams.toString();
    return apiClient.get<AnalyticsOverviewResponse>(
      `/api/analytics/overview${query ? `?${query}` : ''}`
    );
  },

  /**
   * Get chart data
   */
  async getChartData(params: ChartDataParams): Promise<unknown[]> {
    const searchParams = new URLSearchParams();
    searchParams.set('type', params.type);
    if (params.startDate) searchParams.set('startDate', params.startDate);
    if (params.endDate) searchParams.set('endDate', params.endDate);
    if (params.period) searchParams.set('period', params.period);

    const query = searchParams.toString();
    return apiClient.get<unknown[]>(`/api/analytics/charts?${query}`);
  },

  /**
   * Get AI insights
   */
  async getAiInsights(period: string = '30d'): Promise<{ insights: unknown[] }> {
    return apiClient.get<{ insights: unknown[] }>(`/api/copilot/analytics?period=${period}`);
  },
};
