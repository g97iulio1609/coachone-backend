/**
 * Marketplace React Query Hooks
 *
 * Custom hooks for marketplace-related queries and mutations
 */

'use client';

import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import {
  marketplaceKeys,
  marketplaceQueries,
  type MarketplaceFilters,
} from '../queries/marketplace.queries';

/**
 * Hook to get marketplace plans with filters
 */
export function useMarketplacePlans(filters?: MarketplaceFilters) {
  return useQuery({
    queryKey: marketplaceKeys.plans.list(filters),
    queryFn: () => marketplaceQueries.list(filters),
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to get marketplace plans with infinite scroll
 */
export function useMarketplacePlansInfinite(filters?: MarketplaceFilters) {
  return useInfiniteQuery({
    queryKey: marketplaceKeys.plans.list(filters),
    queryFn: ({ pageParam = 1 }) =>
      marketplaceQueries.list({
        ...filters,
        page: pageParam,
      }),
    getNextPageParam: (lastPage) => {
      if (lastPage.hasMore) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to get a marketplace plan by ID
 */
export function useMarketplacePlan(id: string | null | undefined) {
  return useQuery({
    queryKey: marketplaceKeys.plans.detail(id!),
    queryFn: () => marketplaceQueries.getById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
