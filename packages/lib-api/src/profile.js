/**
 * Profile API
 *
 * API functions per user profile data
 */
import { apiClient } from './client';
export const profileApi = {
    /**
     * Get user one rep maxes
     */
    async getOneRepMaxes() {
        return apiClient.get('/api/profile/maxes');
    },
    /**
     * Upsert one rep max
     */
    async upsertOneRepMax(data) {
        return apiClient.post('/api/profile/maxes', data);
    },
    /**
     * Delete one rep max
     */
    async deleteOneRepMax(exerciseId) {
        return apiClient.delete(`/api/profile/maxes/${exerciseId}`);
    },
};
