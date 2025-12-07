/**
 * Workout Service
 *
 * CRUD operations per workout programs
 * Implementa IWorkoutService contract
 */
import type { WorkoutProgram, ApiResponse } from '@OneCoach/types';
import type { IWorkoutService } from '@OneCoach/contracts';
import type { IStorageService } from '@OneCoach/lib-shared';
/**
 * Implementazione Workout Service
 */
export declare class WorkoutService implements IWorkoutService {
    private storage;
    constructor(storage: IStorageService);
    create(workout: Omit<WorkoutProgram, 'id' | 'createdAt' | 'updatedAt'>): ApiResponse<WorkoutProgram>;
    update(id: string, workout: Partial<WorkoutProgram>): ApiResponse<WorkoutProgram>;
    delete(id: string): ApiResponse<void>;
    get(id: string): ApiResponse<WorkoutProgram>;
    getAll(): ApiResponse<WorkoutProgram[]>;
    getByStatus(status: WorkoutProgram['status']): ApiResponse<WorkoutProgram[]>;
    private getAllWorkouts;
}
/**
 * Singleton instance
 */
export declare const workoutService: IWorkoutService;
