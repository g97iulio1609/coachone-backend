/**
 * Workout Import Service
 *
 * Orchestratore principale per l'import di programmi di allenamento da file.
 * Coordina validazione, parsing, matching esercizi e salvataggio.
 *
 * @module lib-workout/services/workout-import
 */

import { prisma } from '@onecoach/lib-core/prisma';
import { createId } from '@onecoach/lib-shared/utils';
import { logger as baseLogger } from '@onecoach/lib-shared/utils/logger';
import type {
  WorkoutProgram,
  WorkoutWeek,
  WorkoutDay,
  Exercise,
  SetGroup,
  ExerciseSet,
} from '@onecoach/types';

import type {
  ImportFile,
  ImportedWorkoutProgram,
  ImportedWeek,
  ImportedDay,
  ImportedExercise,
  ImportOptions,
  ParseResult,
} from '../schemas/imported-workout.schema';
import { IMPORT_LIMITS, ImportOptionsSchema } from '../schemas/imported-workout.schema';

import { FileValidatorService } from './file-validator.service';
import { FileParserService, type AIParseContext } from './file-parser.service';
import { ExerciseMatcherService } from './exercise-matcher.service';

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
  progress: number; // 0-100
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
export class WorkoutImportService {
  private onProgress?: ImportProgressCallback;
  private aiContext?: AIParseContext;
  private config: ImportConfig;
  private context: ImportContext;
  private readonly logger = baseLogger.child('WorkoutImportService');

  constructor(options?: {
    onProgress?: ImportProgressCallback;
    aiContext?: AIParseContext;
    config?: Partial<ImportConfig>;
    context?: ImportContext;
  }) {
    this.onProgress = options?.onProgress;
    this.aiContext = options?.aiContext;
    this.context = options?.context ?? {};
    this.config = {
      maxFileSizeMB: options?.config?.maxFileSizeMB ?? IMPORT_LIMITS.MAX_FILE_SIZE / (1024 * 1024),
      maxFiles: options?.config?.maxFiles ?? IMPORT_LIMITS.MAX_FILES,
      creditCost: options?.config?.creditCost ?? IMPORT_LIMITS.DEFAULT_CREDIT_COST,
      rateLimit: options?.config?.rateLimit ?? IMPORT_LIMITS.RATE_LIMIT_PER_HOUR,
      enableSupabaseStorage: options?.config?.enableSupabaseStorage ?? false,
      defaultMode: options?.config?.defaultMode ?? 'auto',
      matchThreshold: options?.config?.matchThreshold ?? 0.8,
    };
  }

  /**
   * Logging helper with contextual info
   */
  private log(
    level: 'debug' | 'info' | 'warn' | 'error',
    message: string,
    context?: Record<string, unknown>
  ): void {
    const mergedContext = Object.fromEntries(
      Object.entries({
        requestId: this.context.requestId,
        userId: this.context.userId,
        ...context,
      }).filter(([, value]) => value !== undefined)
    );

    if (Object.keys(mergedContext).length === 0) {
      switch (level) {
        case 'debug':
          this.logger.debug(message);
          return;
        case 'info':
          this.logger.info(message);
          return;
        case 'warn':
          this.logger.warn(message);
          return;
        case 'error':
          this.logger.error(message);
          return;
      }
    }

    switch (level) {
      case 'debug':
        this.logger.debug(message, mergedContext);
        break;
      case 'info':
        this.logger.info(message, mergedContext);
        break;
      case 'warn':
        this.logger.warn(message, mergedContext);
        break;
      case 'error':
        this.logger.error(message, mergedContext);
        break;
    }
  }

  /**
   * Emette un evento di progresso
   */
  private emitProgress(progress: ImportProgress): void {
    if (this.onProgress) {
      this.onProgress(progress);
    }
  }

  /**
   * Import completo da file
   */
  async import(
    files: ImportFile[],
    userId: string,
    options?: Partial<ImportOptions>
  ): Promise<ImportResult> {
    const startTime = Date.now();
    const warnings: string[] = [];
    const errors: string[] = [];

    // Merge options con defaults
    const importOptions = ImportOptionsSchema.parse({
      ...options,
      mode: options?.mode ?? this.config.defaultMode,
      matchThreshold: options?.matchThreshold ?? this.config.matchThreshold,
    });

    this.log('info', 'Starting workout import', {
      files: files.length,
      mode: importOptions.mode,
      createMissingExercises: importOptions.createMissingExercises,
      matchThreshold: importOptions.matchThreshold,
      locale: importOptions.locale,
      creditCost: this.config.creditCost,
      fileNames: files.map((file: any) => file.name),
    });

    try {
      // Step 1: Validazione
      this.emitProgress({
        step: 'validating',
        stepNumber: 1,
        totalSteps: 6,
        progress: 0,
        message: 'Validazione file in corso...',
        details: { totalFiles: files.length },
      });

      // Check rate limit
      const rateLimit = FileValidatorService.checkRateLimit(userId);
      if (!rateLimit.allowed) {
        const resetMinutes = Math.ceil(rateLimit.resetIn / 60000);
        throw new Error(`Limite import raggiunto. Riprova tra ${resetMinutes} minuti.`);
      }

      // Valida i file
      const validation = FileValidatorService.validateFiles(files);
      if (!validation.valid) {
        throw new Error(validation.totalErrors.join('\n'));
      }

      this.log('info', 'File validation completed', {
        requestId: this.context.requestId,
        totalFiles: files.length,
      });

      // Aggiungi warnings dalla validazione
      for (const result of validation.results) {
        if (result.result.warnings.length > 0) {
          warnings.push(...result.result.warnings.map((w: any) => `${result.file.name}: ${w}`));
        }
      }

      // Controlla contenuti malevoli
      for (const file of files) {
        const maliciousCheck = FileValidatorService.checkForMaliciousContent(file.content);
        if (!maliciousCheck.safe) {
          warnings.push(`${file.name}: ${maliciousCheck.warnings.join(', ')}`);
        }
      }

      this.emitProgress({
        step: 'validating',
        stepNumber: 1,
        totalSteps: 6,
        progress: 100,
        message: 'Validazione completata',
      });

      // Step 2: Parsing
      this.emitProgress({
        step: 'parsing',
        stepNumber: 2,
        totalSteps: 6,
        progress: 0,
        message: 'Parsing file in corso...',
      });

      const parseResults = await FileParserService.parseFiles(
        files.map((f, idx) => validation.results[idx]!.result.sanitizedFile || f),
        importOptions,
        this.aiContext
      );

      // Aggiungi errori e warnings dal parsing
      for (const error of parseResults.errors) {
        errors.push(`${error.fileName}: ${error.error}`);
      }
      for (const warning of parseResults.warnings) {
        warnings.push(...warning.warnings.map((w: any) => `${warning.fileName}: ${w}`));
      }

      if (parseResults.programs.length === 0) {
        throw new Error('Nessun programma è stato estratto dai file');
      }

      // Combina i programmi
      const combinedProgram = FileParserService.combinePrograms(parseResults.programs);

      this.emitProgress({
        step: 'parsing',
        stepNumber: 2,
        totalSteps: 6,
        progress: 100,
        message: `Parsing completato: ${parseResults.programs.length} programmi estratti`,
      });

      this.log('info', 'Parsing completed', {
        parsedPrograms: parseResults.programs.length,
        parsingWarnings: warnings.length,
        parsingErrors: errors.length,
      });

      // Step 3: Matching esercizi
      this.emitProgress({
        step: 'matching',
        stepNumber: 3,
        totalSteps: 6,
        progress: 0,
        message: 'Matching esercizi con database...',
      });

      // Estrai tutti gli esercizi unici
      const allExercises: ImportedExercise[] = [];
      for (const week of combinedProgram.weeks) {
        for (const day of week.days) {
          allExercises.push(...day.exercises);
        }
      }

      // Match con database
      const matches = await ExerciseMatcherService.matchExercises(
        allExercises,
        importOptions.locale,
        importOptions.matchThreshold
      );

      // Applica i match
      const matchedExercises = ExerciseMatcherService.applyMatches(allExercises, matches);

      // Conta risultati
      const matchedCount = matchedExercises.filter((e: any) => !e.notFound).length;
      const unmatchedCount = matchedExercises.filter((e: any) => e.notFound).length;
      const unmatchedNames = [
        ...new Set(matchedExercises.filter((e: any) => e.notFound).map((e: any) => e.name)),
      ];

      this.log('info', 'Matching completed', {
        matchedCount,
        totalExercises: allExercises.length,
        unmatchedCount,
      });

      this.emitProgress({
        step: 'matching',
        stepNumber: 3,
        totalSteps: 6,
        progress: 100,
        message: `Matching completato: ${matchedCount}/${allExercises.length} esercizi trovati`,
        details: {
          exercisesMatched: matchedCount,
          totalExercises: allExercises.length,
          unmatchedExercises: unmatchedNames,
        },
      });

      // Step 4: Review (solo in modalità review)
      if (importOptions.mode === 'review' && unmatchedCount > 0) {
        this.emitProgress({
          step: 'reviewing',
          stepNumber: 4,
          totalSteps: 6,
          progress: 0,
          message: `${unmatchedCount} esercizi richiedono revisione`,
          details: { unmatchedExercises: unmatchedNames },
        });

        // In modalità review, ritorniamo i risultati parziali per la revisione utente
        const parseResult: ParseResult = {
          program: combinedProgram,
          warnings,
          unmatchedExercises: unmatchedNames.map((name: any) => {
            const match = matches.get(name);

            // Find first occurrence location
            let weekNumber = 1;
            let dayNumber = 1;

            searchLoop: for (const week of combinedProgram.weeks) {
              for (const day of week.days) {
                if (day.exercises.some((e) => e.name === name)) {
                  weekNumber = week.weekNumber;
                  dayNumber = day.dayNumber;
                  break searchLoop;
                }
              }
            }

            return {
              name,
              weekNumber,
              dayNumber,
              suggestions: match?.suggestions || [],
            };
          }),
          stats: {
            totalWeeks: combinedProgram.weeks.length,
            totalDays: combinedProgram.weeks.reduce((sum: any, w: any) => sum + w.days.length, 0),
            totalExercises: allExercises.length,
            matchedExercises: matchedCount,
            unmatchedExercises: unmatchedCount,
          },
        };

        return {
          success: true,
          parseResult,
          errors,
          warnings,
          stats: {
            filesProcessed: parseResults.programs.length,
            exercisesTotal: allExercises.length,
            exercisesMatched: matchedCount,
            exercisesCreated: 0,
            weeksImported: 0,
            daysImported: 0,
            creditsUsed: 0,
          },
        };
      }

      // Step 5: Crea esercizi mancanti (modalità auto)
      let exercisesCreated = 0;
      if (importOptions.createMissingExercises && unmatchedCount > 0) {
        this.emitProgress({
          step: 'converting',
          stepNumber: 5,
          totalSteps: 6,
          progress: 0,
          message: 'Creazione esercizi mancanti...',
        });

        for (const name of unmatchedNames) {
          try {
            const newId = await ExerciseMatcherService.createMissingExercise(
              name,
              combinedProgram.sourceFile || 'import',
              userId,
              importOptions.locale
            );

            // Aggiorna i match
            for (const exercise of matchedExercises) {
              if (exercise.name === name) {
                exercise.catalogExerciseId = newId;
                exercise.notFound = false;
              }
            }

            exercisesCreated++;
          } catch (err) {
            warnings.push(`Impossibile creare esercizio "${name}": ${err}`);
            this.log('warn', 'Failed to create missing exercise', {
              name,
              error: err instanceof Error ? err.message : String(err),
            });
          }
        }
      }

      // Step 6: Converti e salva
      this.emitProgress({
        step: 'converting',
        stepNumber: 5,
        totalSteps: 6,
        progress: 50,
        message: 'Conversione in formato WorkoutProgram...',
      });

      // Aggiorna il programma con gli esercizi matchati
      let exerciseIdx = 0;
      for (const week of combinedProgram.weeks) {
        for (const day of week.days) {
          for (let i = 0; i < day.exercises.length; i++) {
            day.exercises[i] = matchedExercises[exerciseIdx]!;
            exerciseIdx++;
          }
        }
      }

      // Converti in WorkoutProgram
      const workoutProgram = this.convertToWorkoutProgram(combinedProgram, userId);

      this.emitProgress({
        step: 'saving',
        stepNumber: 6,
        totalSteps: 6,
        progress: 0,
        message: 'Salvataggio programma...',
      });

      // Salva nel database
      const programId = await this.saveProgram(workoutProgram, userId);

      // Incrementa rate limit
      FileValidatorService.incrementRateLimit(userId);

      this.emitProgress({
        step: 'completed',
        stepNumber: 6,
        totalSteps: 6,
        progress: 100,
        message: 'Import completato con successo!',
      });

      const elapsedMs = Date.now() - startTime;
      this.log('info', 'Workout import completed', {
        programId,
        elapsedMs,
        exercisesCreated,
        matchedExercises: matchedCount,
        totalExercises: allExercises.length,
        weeksImported: workoutProgram.weeks.length,
      });

      return {
        success: true,
        program: workoutProgram,
        programId,
        errors,
        warnings,
        stats: {
          filesProcessed: parseResults.programs.length,
          exercisesTotal: allExercises.length,
          exercisesMatched: matchedCount,
          exercisesCreated,
          weeksImported: workoutProgram.weeks.length,
          daysImported: workoutProgram.weeks.reduce((sum: any, w: any) => sum + w.days.length, 0),
          creditsUsed: this.config.creditCost,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';

      this.emitProgress({
        step: 'error',
        stepNumber: 0,
        totalSteps: 6,
        progress: 0,
        message: `Errore: ${errorMessage}`,
      });

      this.log('error', 'Workout import failed', {
        error: errorMessage,
        accumulatedErrors: errors,
        warnings,
      });

      return {
        success: false,
        errors: [errorMessage, ...errors],
        warnings,
        stats: {
          filesProcessed: 0,
          exercisesTotal: 0,
          exercisesMatched: 0,
          exercisesCreated: 0,
          weeksImported: 0,
          daysImported: 0,
          creditsUsed: 0,
        },
      };
    }
  }

  /**
   * Converte ImportedWorkoutProgram in WorkoutProgram
   */
  private convertToWorkoutProgram(
    imported: ImportedWorkoutProgram,
    userId: string
  ): WorkoutProgram {
    const now = new Date().toISOString();
    // Generiamo sempre server-side per garantire formato UUID v4
    const programId = createId();

    const weeks: WorkoutWeek[] = imported.weeks.map((week: any) => this.convertWeek(week));

    return {
      id: programId,
      name: imported.name,
      description: imported.description || `Imported from ${imported.sourceFile || 'file'}`,
      difficulty: (imported.difficulty as WorkoutProgram['difficulty']) || 'INTERMEDIATE',
      durationWeeks: imported.durationWeeks || weeks.length,
      weeks,
      goals: imported.goals || [],
      status: 'DRAFT',
      userId,
      version: 1,
      metadata: {
        importedAt: now,
        sourceFile: imported.sourceFile,
        originalAuthor: imported.originalAuthor,
      },
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Converte una settimana importata
   */
  private convertWeek(imported: ImportedWeek): WorkoutWeek {
    return {
      weekNumber: imported.weekNumber,
      days: imported.days.map((day: any) => this.convertDay(day)),
      notes: imported.notes,
      focus: imported.focus,
    };
  }

  /**
   * Converte un giorno importato
   */
  private convertDay(imported: ImportedDay): WorkoutDay {
    return {
      dayNumber: imported.dayNumber,
      name: imported.name || `Day ${imported.dayNumber}`,
      exercises: imported.exercises.map((ex: any) => this.convertExercise(ex)),
      totalDuration: imported.duration,
      notes: imported.notes || '',
      targetMuscles: imported.targetMuscles || [],
      warmup: imported.warmup,
      cooldown: imported.cooldown || '',
    };
  }

  /**
   * Converte un esercizio importato in Exercise con SetGroups
   */
  private convertExercise(imported: ImportedExercise): Exercise {
    const sets = imported.sets || 3;
    const reps = typeof imported.reps === 'number' ? imported.reps : 10;
    const weight = typeof imported.weight === 'number' ? imported.weight : null;
    const rest = imported.rest || 90;

    // Crea il baseSet
    const baseSet: ExerciseSet = {
      reps,
      weight,
      weightLbs: weight ? weight * 2.20462 : null,
      rest,
      intensityPercent: imported.intensityPercent || null,
      rpe: imported.rpe || null,
    };

    // Espandi in serie individuali
    const expandedSets: ExerciseSet[] = Array.from({ length: sets }, () => ({ ...baseSet }));

    // Crea il SetGroup
    const setGroup: SetGroup = {
      id: createId(),
      count: sets,
      baseSet,
      sets: expandedSets,
    };

    return {
      id: createId(),
      name: imported.name,
      description: imported.notes || '',
      category: 'strength', // Default
      muscleGroups: [], // Da inferire o lasciare vuoto
      setGroups: [setGroup],
      notes: imported.notes || '',
      typeLabel: '',
      repRange: typeof imported.reps === 'string' ? imported.reps : `${reps}`,
      formCues: [],
      equipment: imported.equipment || [],
      catalogExerciseId: imported.catalogExerciseId || '',
      videoUrl: undefined,
      variation: imported.variant ? { en: imported.variant } : undefined,
    };
  }

  /**
   * Salva il programma nel database
   */
  private async saveProgram(program: WorkoutProgram, userId: string): Promise<string> {
    const result = await prisma.workout_programs.create({
      data: {
        id: program.id,
        userId,
        name: program.name,
        description: program.description,
        difficulty: program.difficulty,
        durationWeeks: program.durationWeeks,
        goals: program.goals,
        status: program.status,
        weeks: program.weeks as any, // JSON field
        metadata: program.metadata as any,
        version: program.version || 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return result.id;
  }

  /**
   * Ottiene la configurazione import.
   *
   * NOTA: La tabella 'admin_settings' non esiste nel database attuale.
   * La configurazione è gestita tramite le costanti statiche in IMPORT_LIMITS.
   * Se in futuro si desidera rendere la configurazione dinamica, creare
   * prima la tabella e poi implementare la lettura da database.
   */
  static async getConfig(): Promise<ImportConfig> {
    // Configurazione statica da IMPORT_LIMITS - non esiste tabella admin_settings
    return {
      maxFileSizeMB: IMPORT_LIMITS.MAX_FILE_SIZE / (1024 * 1024),
      maxFiles: IMPORT_LIMITS.MAX_FILES,
      creditCost: IMPORT_LIMITS.DEFAULT_CREDIT_COST,
      rateLimit: IMPORT_LIMITS.RATE_LIMIT_PER_HOUR,
      enableSupabaseStorage: false,
      defaultMode: 'auto',
      matchThreshold: 0.8,
    };
  }

  /**
   * Calcola il costo in crediti per un import
   */
  static calculateCreditCost(_filesCount: number, config?: ImportConfig): number {
    const creditCost = config?.creditCost ?? IMPORT_LIMITS.DEFAULT_CREDIT_COST;
    // Costo fisso fino a 10 file
    return creditCost;
  }
}
