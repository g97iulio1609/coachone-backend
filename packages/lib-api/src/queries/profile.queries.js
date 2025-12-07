/**
 * Profile Query Keys and Functions
 *
 * Standardized query keys and query functions for user profile queries
 */
/**
 * Query keys for profile queries
 */
export const profileKeys = {
    all: ['profile'],
    detail: () => [...profileKeys.all, 'detail'],
    weightUnit: () => [...profileKeys.all, 'weightUnit'],
};
/**
 * Query functions for profile
 */
export const profileQueries = {
    /**
     * Get user profile
     */
    get: async () => {
        const response = await fetch('/api/profile', {
            credentials: 'include',
        });
        if (response.status === 401 || response.status === 403) {
            // User not authenticated
            throw new Error('UNAUTHENTICATED');
        }
        if (!response.ok) {
            const payload = await response.json().catch(() => null);
            const message = (payload && typeof payload === 'object' && 'error' in payload
                ? payload.error
                : null) || 'Failed to fetch profile';
            throw new Error(message);
        }
        const payload = await response.json();
        const data = payload.profile;
        if (!data) {
            throw new Error('No profile data');
        }
        return {
            id: data.id,
            userId: data.userId,
            age: data.age ?? null,
            sex: data.sex ?? null,
            heightCm: data.heightCm ?? null,
            weightKg: data.weightKg ? Number(data.weightKg) : null,
            weightUnit: data.weightUnit ?? 'KG',
            activityLevel: data.activityLevel ?? null,
            trainingFrequency: data.trainingFrequency ?? null,
            dailyCalories: data.dailyCalories ?? null,
            nutritionGoals: Array.isArray(data.nutritionGoals) ? data.nutritionGoals : [],
            workoutGoals: Array.isArray(data.workoutGoals) ? data.workoutGoals : [],
            equipment: data.equipment ?? [],
            dietaryRestrictions: data.dietaryRestrictions ?? [],
            dietaryPreferences: data.dietaryPreferences ?? [],
            dietType: data.dietType ?? null,
            healthNotes: data.healthNotes ?? null,
            name: data.user?.name ?? null,
            email: data.user?.email ?? null,
            photoUrl: data.user?.image ?? null,
        };
    },
    /**
     * Update user profile
     */
    update: async (payload) => {
        const response = await fetch('/api/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.error || 'Failed to update profile');
        }
        const result = await response.json();
        const updated = result.profile;
        return {
            id: updated.id,
            userId: updated.userId,
            age: updated.age ?? null,
            sex: updated.sex ?? null,
            heightCm: updated.heightCm ?? null,
            weightKg: updated.weightKg ? Number(updated.weightKg) : null,
            weightUnit: updated.weightUnit ?? 'KG',
            activityLevel: updated.activityLevel ?? null,
            trainingFrequency: updated.trainingFrequency ?? null,
            dailyCalories: updated.dailyCalories ?? null,
            nutritionGoals: Array.isArray(updated.nutritionGoals) ? updated.nutritionGoals : [],
            workoutGoals: Array.isArray(updated.workoutGoals) ? updated.workoutGoals : [],
            equipment: updated.equipment ?? [],
            dietaryRestrictions: updated.dietaryRestrictions ?? [],
            dietaryPreferences: updated.dietaryPreferences ?? [],
            dietType: updated.dietType ?? null,
            healthNotes: updated.healthNotes ?? null,
        };
    },
};
