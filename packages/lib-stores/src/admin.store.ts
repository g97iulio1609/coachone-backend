/**
 * Admin Store
 *
 * Gestisce lo stato condiviso dell'admin panel
 * Mantiene filtri, selezioni e cache durante la navigazione
 * Principi: KISS, SOLID, DRY, YAGNI
 */

'use client';

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

/**
 * Filtri esercizi
 */
export interface ExerciseFilters {
  search: string;
  status: 'ALL' | 'APPROVED' | 'PENDING' | 'REJECTED';
  exerciseTypeId?: string;
  equipmentIds: Set<string>;
  bodyPartIds: Set<string>;
  muscleIds: Set<string>;
  page: number;
}

/**
 * Filtri alimenti
 */
export interface FoodFilters {
  search: string;
  brandId?: string;
  categoryIds: Set<string>;
  barcode?: string;
  kcalMin?: number;
  kcalMax?: number;
  macroDominant?: 'protein' | 'carbs' | 'fats';
  minProteinPct?: number;
  minCarbPct?: number;
  minFatPct?: number;
  page: number;
}

/**
 * Stato admin
 */
export interface AdminState {
  // Filtri
  exerciseFilters: ExerciseFilters;
  foodFilters: FoodFilters;

  // Selezioni
  selectedExerciseIds: Set<string>;
  selectedFoodIds: Set<string>;

  // UI State
  sidebarOpen: boolean;
  lastVisitedRoute: string | null;

  // Actions
  setExerciseFilters: (filters: Partial<ExerciseFilters>) => void;
  resetExerciseFilters: () => void;
  setFoodFilters: (filters: Partial<FoodFilters>) => void;
  resetFoodFilters: () => void;
  setSelectedExerciseIds: (ids: Set<string>) => void;
  toggleExerciseSelection: (id: string) => void;
  clearExerciseSelection: () => void;
  setSelectedFoodIds: (ids: Set<string>) => void;
  toggleFoodSelection: (id: string) => void;
  clearFoodSelection: () => void;
  setSidebarOpen: (open: boolean) => void;
  setLastVisitedRoute: (route: string) => void;
}

const defaultExerciseFilters: ExerciseFilters = {
  search: '',
  status: 'ALL',
  exerciseTypeId: undefined,
  equipmentIds: new Set<string>(),
  bodyPartIds: new Set<string>(),
  muscleIds: new Set<string>(),
  page: 1,
};

const defaultFoodFilters: FoodFilters = {
  search: '',
  brandId: undefined,
  categoryIds: new Set<string>(),
  barcode: undefined,
  kcalMin: undefined,
  kcalMax: undefined,
  macroDominant: undefined,
  minProteinPct: undefined,
  minCarbPct: undefined,
  minFatPct: undefined,
  page: 1,
};

/**
 * Admin Store
 */
export const useAdminStore = create<AdminState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        exerciseFilters: defaultExerciseFilters,
        foodFilters: defaultFoodFilters,
        selectedExerciseIds: new Set<string>(),
        selectedFoodIds: new Set<string>(),
        sidebarOpen: false,
        lastVisitedRoute: null,

        // Exercise filters
        setExerciseFilters: (filters) =>
          set((state) => ({
            exerciseFilters: { ...state.exerciseFilters, ...filters },
          })),

        resetExerciseFilters: () =>
          set({
            exerciseFilters: defaultExerciseFilters,
            selectedExerciseIds: new Set<string>(),
          }),

        // Food filters
        setFoodFilters: (filters) =>
          set((state) => ({
            foodFilters: { ...state.foodFilters, ...filters },
          })),

        resetFoodFilters: () =>
          set({
            foodFilters: defaultFoodFilters,
            selectedFoodIds: new Set<string>(),
          }),

        // Exercise selection
        setSelectedExerciseIds: (ids) => set({ selectedExerciseIds: ids }),

        toggleExerciseSelection: (id) =>
          set((state) => {
            const newSet = new Set(state.selectedExerciseIds);
            if (newSet.has(id)) {
              newSet.delete(id);
            } else {
              newSet.add(id);
            }
            return { selectedExerciseIds: newSet };
          }),

        clearExerciseSelection: () => set({ selectedExerciseIds: new Set<string>() }),

        // Food selection
        setSelectedFoodIds: (ids) => set({ selectedFoodIds: ids }),

        toggleFoodSelection: (id) =>
          set((state) => {
            const newSet = new Set(state.selectedFoodIds);
            if (newSet.has(id)) {
              newSet.delete(id);
            } else {
              newSet.add(id);
            }
            return { selectedFoodIds: newSet };
          }),

        clearFoodSelection: () => set({ selectedFoodIds: new Set<string>() }),

        // UI
        setSidebarOpen: (open) => set({ sidebarOpen: open }),

        setLastVisitedRoute: (route) => set({ lastVisitedRoute: route }),
      }),
      {
        name: 'admin-storage',
        // Solo persistere filtri e route, non le selezioni
        partialize: (state) => ({
          exerciseFilters: {
            ...state.exerciseFilters,
            // Converti Set in array per serializzazione
            equipmentIds: Array.from(state.exerciseFilters.equipmentIds || []),
            bodyPartIds: Array.from(state.exerciseFilters.bodyPartIds || []),
            muscleIds: Array.from(state.exerciseFilters.muscleIds || []),
          },
          foodFilters: {
            ...state.foodFilters,
            categoryIds: Array.from(state.foodFilters.categoryIds || []),
          },
          lastVisitedRoute: state.lastVisitedRoute,
        }),
        // Deserializza array in Set
        merge: (persistedState, currentState) => {
          const ps = persistedState as Partial<AdminState> & {
            exerciseFilters?: Partial<ExerciseFilters> & {
              equipmentIds?: string[];
              bodyPartIds?: string[];
              muscleIds?: string[];
            };
            foodFilters?: Partial<FoodFilters> & {
              categoryIds?: string[];
            };
          };
          return {
            ...currentState,
            ...ps,
            exerciseFilters: ps.exerciseFilters
              ? {
                  ...ps.exerciseFilters,
                  equipmentIds: Array.isArray(ps.exerciseFilters.equipmentIds)
                    ? new Set(ps.exerciseFilters.equipmentIds)
                    : new Set(),
                  bodyPartIds: Array.isArray(ps.exerciseFilters.bodyPartIds)
                    ? new Set(ps.exerciseFilters.bodyPartIds)
                    : new Set(),
                  muscleIds: Array.isArray(ps.exerciseFilters.muscleIds)
                    ? new Set(ps.exerciseFilters.muscleIds)
                    : new Set(),
                }
              : currentState.exerciseFilters,
            foodFilters: ps.foodFilters
              ? {
                  ...ps.foodFilters,
                  categoryIds: Array.isArray(ps.foodFilters.categoryIds)
                    ? new Set(ps.foodFilters.categoryIds)
                    : new Set(),
                }
              : currentState.foodFilters,
          };
        },
      }
    ),
    { name: 'AdminStore' }
  )
);
