/**
 * Workout Import Service
 *
 * Orchestratore principale per l'import di programmi di allenamento da file.
 * Coordina validazione, parsing, matching esercizi e salvataggio.
 *
 * @module lib-workout/services/workout-import
 */
import type { WorkoutProgram } from '@OneCoach/types';
import type { ImportFile, ImportOptions, ParseResult } from '../schemas/imported-workout.schema';
import { type AIParseContext } from './file-parser.service';
/**
 * Progress callback per aggiornamenti in tempo reale
 */
export type ImportProgressCallback = (progress: ImportProgress) => void;
/**
 * Step dell'import
 */
export type ImportStep =
  | 'validating'
  | 'parsing'
  | 'matching'
  | 'reviewing'
  | 'converting'
  | 'saving'
  | 'completed'
  | 'error';
/**
 * Progresso dell'import
 */
export interface ImportProgress {
  step: ImportStep;
  stepNumber: number;
  totalSteps: number;
  progress: number;
  message: string;
  details?: {
    filesProcessed?: number;
    totalFiles?: number;
    exercisesMatched?: number;
    totalExercises?: number;
    unmatchedExercises?: string[];
  };
}
/**
 * Risultato dell'import
 */
export interface ImportResult {
  success: boolean;
  program?: WorkoutProgram;
  programId?: string;
  parseResult?: ParseResult;
  errors: string[];
  warnings: string[];
  stats: {
    filesProcessed: number;
    exercisesTotal: number;
    exercisesMatched: number;
    exercisesCreated: number;
    weeksImported: number;
    daysImported: number;
    creditsUsed: number;
  };
}
/**
 * Configurazione import (da admin settings)
 */
export interface ImportConfig {
  maxFileSizeMB: number;
  maxFiles: number;
  creditCost: number;
  rateLimit: number;
  enableSupabaseStorage: boolean;
  defaultMode: 'auto' | 'review';
  matchThreshold: number;
}
interface ImportContext {
  requestId?: string;
  userId?: string;
}
/**
 * Workout Import Service
 */
export declare class WorkoutImportService {
  private onProgress?;
  private aiContext?;
  private config;
  private context;
  private readonly logger;
  constructor(options?: {
    onProgress?: ImportProgressCallback;
    aiContext?: AIParseContext;
    config?: Partial<ImportConfig>;
    context?: ImportContext;
  });
  /**
   * Logging helper with contextual info
   */
  private log;
  /**
   * Emette un evento di progresso
   */
  private emitProgress;
  /**
   * Import completo da file
   */
  import(
    files: ImportFile[],
    userId: string,
    options?: Partial<ImportOptions>
  ): Promise<ImportResult>;
  /**
   * Converte ImportedWorkoutProgram in WorkoutProgram
   */
  private convertToWorkoutProgram;
  /**
   * Converte una settimana importata
   */
  private convertWeek;
  /**
   * Converte un giorno importato
   */
  private convertDay;
  /**
   * Converte un esercizio importato in Exercise con SetGroups
   */
  private convertExercise;
  /**
   * Salva il programma nel database
   */
  private saveProgram;
  /**
   * Ottiene la configurazione import.
   *
   * NOTA: La tabella 'admin_settings' non esiste nel database attuale.
   * La configurazione è gestita tramite le costanti statiche in IMPORT_LIMITS.
   * Se in futuro si desidera rendere la configurazione dinamica, creare
   * prima la tabella e poi implementare la lettura da database.
   */
  static getConfig(): Promise<ImportConfig>;
  /**
   * Calcola il costo in crediti per un import
   */
  static calculateCreditCost(_filesCount: number, config?: ImportConfig): number;
}
export {};
