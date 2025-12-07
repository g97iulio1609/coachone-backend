import { prisma } from '@onecoach/lib-core/prisma';
import { createId } from '@onecoach/lib-shared/utils';
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
} from '../schemas/imported-workout.schema';
import { ImportOptionsSchema, IMPORT_LIMITS as WORKOUT_LIMITS } from '../schemas/imported-workout.schema';

import { FileValidatorService } from './file-validator.service';
import { FileParserService, type AIParseContext } from './file-parser.service';
import { ExerciseMatcherService } from './exercise-matcher.service';
import type { BaseImportResult } from '@onecoach/lib-import-core';
import { BaseImportService } from '@onecoach/lib-import-core';

/**
 * Risultato dell'import
 */
export interface WorkoutImportResult extends BaseImportResult {
  program?: WorkoutProgram;
  programId?: string;
  stats?: {
    filesProcessed: number;
    exercisesTotal: number;
    exercisesMatched: number;
    exercisesCreated: number;
    weeksImported: number;
    daysImported: number;
    creditsUsed: number;
  };
  // Proprietà extra per compatibilità/debug
  parseResult?: any;
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

type ParsedWorkoutData = {
  combinedProgram: ImportedWorkoutProgram;
  warnings: string[];
  errors: string[];
  stats: {
    filesProcessed: number;
    parsingWarnings: number;
    parsingErrors: number;
  };
};

/**
 * Workout Import Service
 */
export class WorkoutImportService extends BaseImportService<ParsedWorkoutData, WorkoutImportResult> {
  protected getLoggerName(): string {
    return 'WorkoutImportService';
  }

  // Override validateFiles to add domain-specific checks
  protected override validateFiles(files: ImportFile[]): void {
    // Basic validation
    super.validateFiles(files);

    // Check rate limit
    const rateLimit = FileValidatorService.checkRateLimit(this.context.userId);
    if (!rateLimit.allowed) {
      const resetMinutes = Math.ceil(rateLimit.resetIn / 60000);
      throw new Error(`Limite import raggiunto. Riprova tra ${resetMinutes} minuti.`);
    }

    // Advanced validation
    const validation = FileValidatorService.validateFiles(files);
    if (!validation.valid) {
      throw new Error(validation.totalErrors.join('\n'));
    }

    this.logger.info('File validation completed', {
      requestId: this.context.requestId,
      totalFiles: files.length,
    });
  }

  // Override parseFiles to handle multiple files and use FileParserService
  protected override async parseFiles(
    files: ImportFile[],
    options?: Partial<ImportOptions>
  ): Promise<ParsedWorkoutData> {
    const importOptions = ImportOptionsSchema.parse({
      ...options,
      matchThreshold: options?.matchThreshold ?? 0.8,
    });

    const parseResults = await FileParserService.parseFiles(
      files,
      importOptions,
      this.aiContext as unknown as AIParseContext
    );

    const warnings: string[] = [];
    const errors: string[] = [];

    for (const error of parseResults.errors) {
      errors.push(`${error.fileName}: ${error.error}`);
    }
    for (const warning of parseResults.warnings) {
      warnings.push(...warning.warnings.map((w: any) => `${warning.fileName}: ${w}`));
    }

    if (parseResults.programs.length === 0) {
      throw new Error('Nessun programma è stato estratto dai file');
    }

    const combinedProgram = FileParserService.combinePrograms(parseResults.programs);

    return {
      combinedProgram,
      warnings,
      errors,
      stats: {
        filesProcessed: parseResults.programs.length,
        parsingWarnings: warnings.length,
        parsingErrors: errors.length,
      },
    };
  }

  // Implementation is unused due to override
  protected buildPrompt(_options?: Partial<ImportOptions>): string {
    return '';
  }

  protected async processParsed(
    parsed: ParsedWorkoutData,
    userId: string,
    options?: Partial<ImportOptions>
  ): Promise<any> {
    const { combinedProgram } = parsed;
    const importOptions = ImportOptionsSchema.parse(options || {});

    // Step 3: Matching esercizi
    this.emit({
      step: 'matching',
      message: 'Matching esercizi con database...',
      progress: 0,
    });

    const allExercises: ImportedExercise[] = [];
    for (const week of combinedProgram.weeks) {
      for (const day of week.days) {
        allExercises.push(...day.exercises);
      }
    }

    const matches = await ExerciseMatcherService.matchExercises(
      allExercises,
      importOptions.locale,
      importOptions.matchThreshold
    );

    const matchedExercises = ExerciseMatcherService.applyMatches(allExercises, matches);

    const matchedCount = matchedExercises.filter((e: any) => !e.notFound).length;
    const unmatchedCount = matchedExercises.filter((e: any) => e.notFound).length;
    const unmatchedNames = [
      ...new Set(matchedExercises.filter((e: any) => e.notFound).map((e: any) => e.name)),
    ];

    // Step 4: Review (pseudo-step)
    // If review mode, we should technically stop here?
    // BaseImportService doesn't support stopping/returning early easily without throwing?
    // Or we return a result that indicates "review required"?
    // If mode is review and unmatched > 0, we return early.
    // We can throw a special error or just return a result?
    // But processParsed returns 'unknown' passed to 'persist'.
    // If we want to return from 'import', we must bubble up.
    // We'll handle it by returning a special object that persist handles?
    // Or just proceed and handle review logic.

    const needsReview = importOptions.mode === 'review' && unmatchedCount > 0;

    if (needsReview) {
      // We package the data needed for review response
      return {
        needsReview: true,
        parseResult: {
          program: combinedProgram,
          warnings: parsed.warnings,
          unmatchedExercises: unmatchedNames.map(name => ({
            name,
            suggestions: matches.get(name)?.suggestions || []
          })),
          stats: { ...parsed.stats, matchedExercises: matchedCount, unmatchedExercises: unmatchedCount }
        },
        warnings: parsed.warnings,
        errors: parsed.errors
      };
    }

    // Step 5: Create missing
    let exercisesCreated = 0;
    if (importOptions.createMissingExercises && unmatchedCount > 0) {
      this.emit({
        step: 'matching', // using matching step for conversion UI
        message: 'Creazione esercizi mancanti...',
        progress: 0.8,
      });

      for (const name of unmatchedNames) {
        try {
          const newId = await ExerciseMatcherService.createMissingExercise(
            name,
            combinedProgram.sourceFile || 'import',
            userId,
            importOptions.locale
          );
          // Update matches
          for (const exercise of matchedExercises) {
            if (exercise.name === name) {
              exercise.catalogExerciseId = newId;
              exercise.notFound = false;
            }
          }
          exercisesCreated++;
        } catch (err) {
          const msg = `Impossibile creare esercizio "${name}": ${err}`;
          parsed.warnings.push(msg);
          this.logger.warn(msg);
        }
      }
    }

    // Apply matches back to program
    let exerciseIdx = 0;
    for (const week of combinedProgram.weeks) {
      for (const day of week.days) {
        for (let i = 0; i < day.exercises.length; i++) {
          day.exercises[i] = matchedExercises[exerciseIdx]!;
          exerciseIdx++;
        }
      }
    }

    const workoutProgram = this.convert(combinedProgram, userId);

    return {
      workoutProgram,
      stats: {
        filesProcessed: parsed.stats.filesProcessed,
        exercisesTotal: allExercises.length,
        exercisesMatched: matchedCount,
        exercisesCreated,
        weeksImported: workoutProgram.weeks.length,
        daysImported: workoutProgram.weeks.reduce((sum: any, w: any) => sum + w.days.length, 0),
        creditsUsed: WORKOUT_LIMITS.DEFAULT_CREDIT_COST, // simplificied
      },
      warnings: parsed.warnings,
      errors: parsed.errors
    };
  }

  protected async persist(
    processed: any,
    userId: string
  ): Promise<Partial<WorkoutImportResult>> {
    if (processed.needsReview) {
      // Return review result without persisting
      return {
        success: true,
        parseResult: processed.parseResult,
        warnings: processed.warnings,
        errors: processed.errors,
        stats: processed.parseResult.stats // Map appropriately
      };
    }

    const { workoutProgram, stats, warnings, errors } = processed;

    const result = await prisma.workout_programs.create({
      data: {
        id: workoutProgram.id,
        userId,
        name: workoutProgram.name,
        description: workoutProgram.description,
        difficulty: workoutProgram.difficulty,
        durationWeeks: workoutProgram.durationWeeks,
        goals: workoutProgram.goals,
        status: workoutProgram.status,
        weeks: workoutProgram.weeks as any,
        metadata: workoutProgram.metadata as any,
        version: workoutProgram.version || 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    FileValidatorService.incrementRateLimit(userId);

    return {
      programId: result.id,
      program: workoutProgram,
      stats,
      warnings,
      errors
    };
  }

  protected createErrorResult(errors: string[]): Partial<WorkoutImportResult> {
    return {
      success: false,
      errors,
      stats: {
        filesProcessed: 0,
        exercisesTotal: 0,
        exercisesMatched: 0,
        exercisesCreated: 0,
        weeksImported: 0,
        daysImported: 0,
        creditsUsed: 0
      }
    };
  }

  // Helpers
  private convert(imported: ImportedWorkoutProgram, userId: string): WorkoutProgram {
    const now = new Date().toISOString();
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

  private convertWeek(imported: ImportedWeek): WorkoutWeek {
    return {
      weekNumber: imported.weekNumber,
      days: imported.days.map((day: any) => this.convertDay(day)),
      notes: imported.notes,
      focus: imported.focus,
    };
  }

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

  private convertExercise(imported: ImportedExercise): Exercise {
    const sets = imported.sets || 3;
    const reps = typeof imported.reps === 'number' ? imported.reps : 10;
    const weight = typeof imported.weight === 'number' ? imported.weight : null;
    const rest = imported.rest || 90;

    const baseSet: ExerciseSet = {
      reps,
      weight,
      weightLbs: weight ? weight * 2.20462 : null,
      rest,
      intensityPercent: imported.intensityPercent || null,
      rpe: imported.rpe || null,
    };

    const expandedSets: ExerciseSet[] = Array.from({ length: sets }, () => ({ ...baseSet }));

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
      category: 'strength',
      muscleGroups: [],
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
}
