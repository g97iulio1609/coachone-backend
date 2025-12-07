/**
 * Marketplace Query Keys and Functions
 *
 * Standardized query keys and query functions for marketplace queries
 */
/**
 * Base query key for marketplace
 */
const marketplaceBaseKey = ['marketplace'];
/**
 * Query keys for marketplace queries
 */
export const marketplaceKeys = {
    all: marketplaceBaseKey,
    plans: {
        all: [...marketplaceBaseKey, 'plans'],
        lists: () => [...marketplaceBaseKey, 'plans', 'list'],
        list: (filters) => [...marketplaceBaseKey, 'plans', 'list', filters],
        details: () => [...marketplaceBaseKey, 'plans', 'detail'],
        detail: (id) => [...marketplaceBaseKey, 'plans', 'detail', id],
    },
};
/**
 * Query functions for marketplace
 */
export const marketplaceQueries = {
    /**
     * Get marketplace plans list
     */
    list: async (filters) => {
        const params = new URLSearchParams();
        if (filters?.planType)
            params.append('planType', filters.planType);
        if (filters?.minPrice)
            params.append('minPrice', filters.minPrice.toString());
        if (filters?.maxPrice)
            params.append('maxPrice', filters.maxPrice.toString());
        if (filters?.minRating)
            params.append('minRating', filters.minRating.toString());
        if (filters?.coachId)
            params.append('coachId', filters.coachId);
        if (filters?.searchQuery)
            params.append('q', filters.searchQuery);
        if (filters?.sortBy)
            params.append('sortBy', filters.sortBy);
        if (filters?.sortOrder)
            params.append('sortOrder', filters.sortOrder);
        if (filters?.page)
            params.append('page', filters.page.toString());
        if (filters?.limit)
            params.append('limit', filters.limit.toString());
        const url = `/api/marketplace/plans${params.toString() ? `?${params.toString()}` : ''}`;
        const response = await fetch(url, {
            credentials: 'include',
        });
        if (response.status === 401 || response.status === 403) {
            throw new Error('UNAUTHENTICATED');
        }
        if (!response.ok) {
            const payload = await response.json().catch(() => null);
            const message = (payload && typeof payload === 'object' && 'error' in payload
                ? payload.error
                : null) || 'Failed to fetch marketplace plans';
            throw new Error(message);
        }
        return await response.json();
    },
    /**
     * Get marketplace plan by ID
     */
    getById: async (id) => {
        const response = await fetch(`/api/marketplace/plans/${id}`, {
            credentials: 'include',
        });
        if (response.status === 401 || response.status === 403) {
            throw new Error('UNAUTHENTICATED');
        }
        if (!response.ok) {
            const payload = await response.json().catch(() => null);
            const message = (payload && typeof payload === 'object' && 'error' in payload
                ? payload.error
                : null) || 'Failed to fetch marketplace plan';
            throw new Error(message);
        }
        return await response.json();
    },
};
