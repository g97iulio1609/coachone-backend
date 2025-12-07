/**
 * Credits Query Keys and Functions
 *
 * Standardized query keys and query functions for credits-related queries
 */

import { apiClient } from '../client';

/**
 * Credit balance response
 */
export interface CreditBalanceResponse {
  balance: number;
  hasUnlimitedCredits: boolean;
  totalConsumed: number;
  totalAdded: number;
  lastTransaction?: {
    id: string;
    type: 'ADDED' | 'CONSUMED';
    amount: number;
    createdAt: string;
  } | null;
}

/**
 * Credit transaction
 */
export interface CreditTransaction {
  id: string;
  type: 'ADDED' | 'CONSUMED';
  amount: number;
  description: string;
  createdAt: string;
}

/**
 * Credit history response
 */
export interface CreditHistoryResponse {
  transactions: CreditTransaction[];
  total: number;
}

/**
 * Query keys for credits queries
 */
export const creditsKeys = {
  all: ['credits'] as const,
  balance: () => [...creditsKeys.all, 'balance'] as const,
  history: (limit?: number) => [...creditsKeys.all, 'history', limit] as const,
} as const;

/**
 * Query functions for credits
 */
export const creditsQueries = {
  /**
   * Get credit balance
   */
  getBalance: async (): Promise<CreditBalanceResponse> => {
    const response = await apiClient.get<CreditBalanceResponse>('/api/credits/balance');
    return response;
  },

  /**
   * Get credit history
   */
  getHistory: async (limit = 50): Promise<CreditHistoryResponse> => {
    const response = await apiClient.get<CreditHistoryResponse>(
      `/api/credits/history?limit=${limit}`
    );
    return response;
  },
};
