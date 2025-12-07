/**
 * Health Store
 *
 * Manages UI state for health data synchronization
 * Replaces HealthContext with Zustand store
 * Business logic (API calls, health kit operations) is in TanStack Query hooks
 */

'use client';

import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';

/**
 * Health Platform type
 */
export type HealthPlatform = 'ios' | 'android';

/**
 * Health Permissions interface
 */
export interface HealthPermissions {
  steps: boolean;
  heartRate: boolean;
  activeCalories: boolean;
  weight: boolean;
  workout: boolean;
}

/**
 * Health Summary interface
 */
export interface HealthSummary {
  steps: {
    today: number;
    week: number;
    lastSync: Date | null;
  };
  heartRate: {
    latest: number | null;
    average: number | null;
    lastSync: Date | null;
  };
  activeCalories: {
    today: number;
    week: number;
    lastSync: Date | null;
  };
  weight: {
    latest: number | null;
    trend: 'up' | 'down' | 'stable' | null;
    lastSync: Date | null;
  };
  workouts: {
    count: number;
    totalMinutes: number;
    lastSync: Date | null;
  };
}

/**
 * Sync Status interface
 */
export interface SyncStatus {
  isSyncing: boolean;
  lastSyncTime: Date | null;
  syncError: string | null;
}

/**
 * Health state interface
 */
export interface HealthState {
  permissions: HealthPermissions | null;
  syncStatus: SyncStatus;
  healthSummary: HealthSummary | null;
  isAutoSyncEnabled: boolean;
  isAvailable: boolean;
  platform: HealthPlatform | null;
}

/**
 * Health actions interface
 */
export interface HealthActions {
  setPermissions: (permissions: HealthPermissions | null) => void;
  setSyncStatus: (status: SyncStatus | ((prev: SyncStatus) => SyncStatus)) => void;
  setHealthSummary: (summary: HealthSummary | null) => void;
  setIsAutoSyncEnabled: (enabled: boolean) => void;
  setIsAvailable: (available: boolean) => void;
  setPlatform: (platform: HealthPlatform) => void;
  clearSyncError: () => void;
}

/**
 * Combined store type
 */
export type HealthStore = HealthState & HealthActions;

/**
 * Initial state
 */
const initialState: HealthState = {
  permissions: null,
  syncStatus: {
    isSyncing: false,
    lastSyncTime: null,
    syncError: null,
  },
  healthSummary: null,
  isAutoSyncEnabled: false,
  isAvailable: false,
  platform: null,
};

/**
 * Health Store
 *
 * Persists auto-sync preference
 */
export const useHealthStore = create<HealthStore>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        setPermissions: (permissions) => set({ permissions }),

        setSyncStatus: (status) =>
          set((state) => ({
            syncStatus: typeof status === 'function' ? status(state.syncStatus) : status,
          })),

        setHealthSummary: (summary) => set({ healthSummary: summary }),

        setIsAutoSyncEnabled: (enabled) => set({ isAutoSyncEnabled: enabled }),

        setIsAvailable: (available) => set({ isAvailable: available }),

        setPlatform: (platform) => set({ platform }),

        clearSyncError: () =>
          set((state) => ({
            syncStatus: {
              ...state.syncStatus,
              syncError: null,
            },
          })),
      }),
      {
        name: 'health-storage',
        storage: createJSONStorage(() => {
          if (typeof window !== 'undefined') {
            return localStorage;
          }
          // For React Native, this will be replaced by AsyncStorage in the app
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }),
        partialize: (state) => ({
          isAutoSyncEnabled: state.isAutoSyncEnabled,
          syncStatus: {
            ...state.syncStatus,
            // Don't persist isSyncing (runtime state)
            isSyncing: false,
          },
        }),
      }
    ),
    {
      name: 'HealthStore',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

/**
 * Selector hooks for better performance
 */
export const useHealthPermissions = () =>
  useHealthStore((state) => ({
    permissions: state.permissions,
    setPermissions: state.setPermissions,
    hasAllPermissions: () => {
      if (!state.permissions) return false;
      return Object.values(state.permissions).every((granted) => granted);
    },
  }));

export const useHealthSync = () =>
  useHealthStore((state) => ({
    syncStatus: state.syncStatus,
    setSyncStatus: state.setSyncStatus,
    clearSyncError: state.clearSyncError,
    isAutoSyncEnabled: state.isAutoSyncEnabled,
    setIsAutoSyncEnabled: state.setIsAutoSyncEnabled,
  }));

export const useHealthSummary = () =>
  useHealthStore((state) => ({
    healthSummary: state.healthSummary,
    setHealthSummary: state.setHealthSummary,
  }));
