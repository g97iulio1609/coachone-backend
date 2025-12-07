/**
 * Workout Builder Store
 *
 * Gestisce lo stato del builder workout con UI state locale e
 * placeholder per integrazione Supabase Realtime.
 *
 * TODO: Refactor per dependency injection di supabase client e workout API
 */

import { create, type StoreApi, type UseBoundStore } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { WorkoutProgram } from '@OneCoach/types';

// SSOT Types
interface WorkoutBuilderState {
  // State
  activeProgram: WorkoutProgram | null;
  isLoading: boolean;
  isSaving: boolean;
  isRealtimeConnected: boolean;

  // UI State (Local)
  selectedWeekIndex: number;
  selectedDayIndex: number;
  viewMode: 'editor' | 'statistics' | 'progression';

  // Actions
  init: (programId: string) => Promise<void>;
  setProgram: (program: WorkoutProgram) => void;
  updateProgram: (updates: Partial<WorkoutProgram>) => void;
  cleanup: () => void;

  // UI Actions
  setSelectedWeek: (index: number) => void;
  setSelectedDay: (index: number) => void;
  setViewMode: (mode: 'editor' | 'statistics' | 'progression') => void;
}

export const useWorkoutBuilderStore: UseBoundStore<StoreApi<WorkoutBuilderState>> =
  create<WorkoutBuilderState>()(
    persist(
      immer((set, get) => ({
        // Initial State
        activeProgram: null,
        isLoading: false,
        isSaving: false,
        isRealtimeConnected: false,
        selectedWeekIndex: 0,
        selectedDayIndex: 0,
        viewMode: 'editor',

        // Actions - TODO: Implement with proper dependency injection
        init: async (_programId: string) => {
          set({ isLoading: true });
          // TODO: Inject workoutApi and supabase client
          console.warn('WorkoutBuilderStore.init: Not implemented - needs dependency injection');
          set({ isLoading: false });
        },

        cleanup: () => {
          // TODO: Implement cleanup with injected supabase client
          set({ activeProgram: null, isRealtimeConnected: false });
        },

        setProgram: (program: WorkoutProgram) => {
          set({ activeProgram: program });
        },

        updateProgram: (updates: Partial<WorkoutProgram>) => {
          const currentProgram = get().activeProgram;
          if (!currentProgram) return;

          // Optimistic Update
          set((state) => {
            if (state.activeProgram) {
              Object.assign(state.activeProgram, updates);
            }
          });

          // TODO: Implement autosave with injected workoutApi
          console.warn(
            'WorkoutBuilderStore.updateProgram: Autosave not implemented - needs dependency injection'
          );
        },

        // UI Actions
        setSelectedWeek: (index: number) => set({ selectedWeekIndex: index }),
        setSelectedDay: (index: number) => set({ selectedDayIndex: index }),
        setViewMode: (mode: 'editor' | 'statistics' | 'progression') => set({ viewMode: mode }),
      })),
      {
        name: 'workout-builder-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          selectedWeekIndex: state.selectedWeekIndex,
          selectedDayIndex: state.selectedDayIndex,
          viewMode: state.viewMode,
        }),
      }
    )
  );
