/**
 * Workout Tracking Service
 *
 * Service layer for managing workout session tracking.
 * Handles CRUD operations for WorkoutSession entities.
 *
 * SSOT: Usa SOLO setGroups per le serie, non exercise.sets legacy.
 *
 * Follows SOLID principles:
 * - Single Responsibility: Only manages workout session data
 * - Open/Closed: Extendable without modification
 * - Dependency Inversion: Depends on Prisma abstraction
 */
import type { WorkoutSession, CreateWorkoutSessionRequest, UpdateWorkoutSessionRequest, WorkoutProgramStats } from '@OneCoach/types';
/**
 * Create a new workout session
 *
 * Initializes a workout session with the exercises from the specified program day.
 * Session starts with all tracking fields empty (to be filled by user).
 */
export declare function createWorkoutSession(userId: string, request: CreateWorkoutSessionRequest): Promise<WorkoutSession>;
/**
 * Get a workout session by ID
 */
export declare function getWorkoutSession(sessionId: string, userId: string): Promise<WorkoutSession | null>;
/**
 * Get all workout sessions for a user
 *
 * @param userId - User ID
 * @param programId - Optional filter by program ID
 * @param limit - Max number of sessions to return
 */
export declare function getWorkoutSessions(userId: string, programId?: string, limit?: number): Promise<WorkoutSession[]>;
/**
 * Get all sessions for a specific program
 */
export declare function getProgramSessions(programId: string, userId: string): Promise<WorkoutSession[]>;
/**
 * Update a workout session
 *
 * Typically called during or after a workout to update tracking data.
 */
export declare function updateWorkoutSession(sessionId: string, userId: string, updates: UpdateWorkoutSessionRequest): Promise<WorkoutSession>;
/**
 * Delete a workout session
 */
export declare function deleteWorkoutSession(sessionId: string, userId: string): Promise<void>;
/**
 * Get workout program statistics
 *
 * Calculates completion rate, total sessions, etc. for a program.
 */
export declare function getWorkoutProgramStats(programId: string, userId: string): Promise<WorkoutProgramStats>;
/**
 * Check if a session exists for a specific program day
 *
 * Useful for UI to show if user already tracked a specific day.
 */
export declare function hasSessionForDay(userId: string, programId: string, weekNumber: number, dayNumber: number): Promise<boolean>;
/**
 * Get latest session for a program
 */
export declare function getLatestProgramSession(programId: string, userId: string): Promise<WorkoutSession | null>;
