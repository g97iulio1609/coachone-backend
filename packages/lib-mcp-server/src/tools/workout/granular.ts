/**
 * MCP Tools: Granular Session Management
 *
 * Advanced MCP tools for granular manipulation of workout sessions.
 * Provides fine-grained control over every field at every level.
 *
 * SOLID Principles:
 * - Single Responsibility: Each tool does one thing well
 * - Open/Closed: Extensible through new tool additions
 * - Interface Segregation: Small, focused tool interfaces
 *
 * @module lib-mcp-server/tools/workout/granular
 */

import { z } from 'zod';
import type { McpTool } from '../../types';
import { GranularSessionService } from '@onecoach/lib-workout';
import { workoutProgramSchema } from '@onecoach/schemas';
import { normalizeWorkoutProgram } from './program-normalizer';
import { prisma } from '@onecoach/lib-core';
import { Prisma } from '@prisma/client';

// =====================================================
// MCP-Safe Schema (JSON-compatible for AI SDK)
// =====================================================

/**
 * MCP-safe version of workoutProgramSchema
 * 
 * The original schema uses z.coerce.date() for createdAt/updatedAt which
 * cannot be converted to JSON Schema for AI SDK tool definitions.
 * This version uses z.string() for timestamps instead.
 */
const mcpWorkoutProgramSchema = workoutProgramSchema.extend({
  createdAt: z.string().optional().describe('ISO 8601 timestamp'),
  updatedAt: z.string().optional().describe('ISO 8601 timestamp'),
});

// =====================================================
// Schema Definitions
// =====================================================

/**
 * Session Target Schema - identifies a location in the program
 */
const SessionTargetSchema = z.object({
  weekNumber: z.number().int().positive().describe('Week number (1-based)'),
  dayNumber: z.number().int().positive().describe('Day number within the week (1-based)'),
  exerciseIndex: z.number().int().nonnegative().describe('Exercise index (0-based)'),
  setGroupIndex: z.number().int().nonnegative().optional().describe('SetGroup index (0-based)'),
  setIndex: z.number().int().nonnegative().optional().describe('Set index within group (0-based)'),
});

/**
 * Set Field Update Schema - granular field updates for sets
 */
const SetFieldUpdateSchema = z.object({
  reps: z.number().int().positive().optional().describe('Number of repetitions'),
  repsMax: z.number().int().positive().optional().describe('Maximum reps (for ranges)'),
  duration: z
    .number()
    .positive()
    .optional()
    .describe('Duration in seconds (for time-based exercises)'),
  weight: z.number().nonnegative().optional().describe('Weight in kg'),
  weightMax: z.number().nonnegative().optional().describe('Maximum weight in kg (for ranges)'),
  weightLbs: z
    .number()
    .nonnegative()
    .optional()
    .describe('Weight in lbs (auto-calculated if weight provided)'),
  intensityPercent: z.number().min(0).max(100).optional().describe('Intensity as % of 1RM'),
  intensityPercentMax: z
    .number()
    .min(0)
    .max(100)
    .optional()
    .describe('Maximum intensity % (for ranges)'),
  rpe: z.number().min(1).max(10).optional().describe('RPE (Rate of Perceived Exertion)'),
  rpeMax: z.number().min(1).max(10).optional().describe('Maximum RPE (for ranges)'),
  rest: z.number().int().positive().optional().describe('Rest time in seconds'),
});

/**
 * SetGroup Update Schema - includes count and all set fields
 */
const SetGroupUpdateSchema = SetFieldUpdateSchema.extend({
  count: z.number().int().positive().optional().describe('Number of sets in the group'),
});

/**
 * Exercise Update Schema
 */
const ExerciseUpdateSchema = z.object({
  name: z.string().min(1).optional().describe('Exercise name'),
  description: z.string().optional().describe('Exercise description'),
  notes: z.string().optional().describe('Additional notes'),
  typeLabel: z.string().optional().describe('Type label (e.g., "Compound", "Isolation")'),
  repRange: z.string().optional().describe('Rep range display (e.g., "8-12")'),
  formCues: z.array(z.string()).optional().describe('Form cues for proper execution'),
  equipment: z.array(z.string()).optional().describe('Required equipment'),
  videoUrl: z.string().url().optional().describe('Video demonstration URL'),
});

/**
 * Day Update Schema
 */
const DayUpdateSchema = z.object({
  name: z.string().optional().describe('Day name'),
  notes: z.string().optional().describe('Day notes'),
  warmup: z.string().optional().describe('Warmup instructions'),
  cooldown: z.string().optional().describe('Cooldown instructions'),
  totalDuration: z.number().positive().optional().describe('Total duration in minutes'),
  targetMuscles: z.array(z.string()).optional().describe('Target muscle groups'),
});

/**
 * Week Update Schema
 */
const WeekUpdateSchema = z.object({
  focus: z.string().optional().describe('Week focus (e.g., "Volume", "Intensity")'),
  notes: z.string().optional().describe('Week notes'),
});

// =====================================================
// Tool: Granular Set Group Update
// =====================================================

const granularSetGroupUpdateParams = z.object({
  program: mcpWorkoutProgramSchema,
  target: SessionTargetSchema,
  update: SetGroupUpdateSchema,
  oneRepMax: z
    .number()
    .positive()
    .optional()
    .describe('1RM value for automatic intensity calculations'),
});

type GranularSetGroupUpdateParams = z.infer<typeof granularSetGroupUpdateParams>;

export const workoutGranularSetGroupUpdateTool: McpTool<GranularSetGroupUpdateParams> = {
  name: 'workout_granular_setgroup_update',
  description: `Updates a specific SetGroup with granular field changes.
  
Supports:
- Changing set count (adds/removes sets)
- Updating reps, weight, intensity, RPE, rest
- Automatic kg <-> lbs conversion
- Automatic weight <-> intensity conversion (if 1RM provided)
- Range values (min/max) for progressive sets

Example: "Change Week 2, Day 1, Exercise 0 to 5 sets of 8 reps at RPE 8"`,
  parameters: granularSetGroupUpdateParams,
  execute: async (args) => {
    const { program, target, update, oneRepMax } = args;
    const normalizedProgram = normalizeWorkoutProgram(program);

    const result = GranularSessionService.updateSetGroup(
      normalizedProgram,
      target,
      update,
      oneRepMax
    );

    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }

    return {
      success: true,
      program: result.program,
      message: `Updated SetGroup at Week ${target.weekNumber}, Day ${target.dayNumber}, Exercise ${target.exerciseIndex}`,
      modifiedFields: Object.keys(update),
    };
  },
};

// =====================================================
// Tool: Granular Individual Set Update
// =====================================================

const granularIndividualSetUpdateParams = z.object({
  program: mcpWorkoutProgramSchema,
  target: SessionTargetSchema.extend({
    setGroupIndex: z.number().int().nonnegative(),
    setIndex: z.number().int().nonnegative(),
  }),
  update: SetFieldUpdateSchema,
  oneRepMax: z.number().positive().optional(),
});

type GranularIndividualSetUpdateParams = z.infer<typeof granularIndividualSetUpdateParams>;

export const workoutGranularIndividualSetUpdateTool: McpTool<GranularIndividualSetUpdateParams> = {
  name: 'workout_granular_individual_set_update',
  description: `Updates a specific individual set within a SetGroup.
  
Use this for:
- Creating pyramid sets (different weight/reps per set)
- Drop sets (decreasing weight)
- Ramping sets (increasing intensity)
- Custom progression within a single exercise

Example: "Set the 4th set of squats to be a backoff set at 80% of the weight"`,
  parameters: granularIndividualSetUpdateParams,
  execute: async (args) => {
    const { program, target, update, oneRepMax } = args;
    const normalizedProgram = normalizeWorkoutProgram(program);

    const result = GranularSessionService.updateIndividualSet(
      normalizedProgram,
      target,
      update,
      oneRepMax
    );

    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }

    return {
      success: true,
      program: result.program,
      message: `Updated Set ${target.setIndex} in SetGroup ${target.setGroupIndex} at Week ${target.weekNumber}, Day ${target.dayNumber}, Exercise ${target.exerciseIndex}`,
    };
  },
};

// =====================================================
// Tool: Granular Exercise Update
// =====================================================

const granularExerciseUpdateParams = z.object({
  program: mcpWorkoutProgramSchema,
  target: SessionTargetSchema,
  update: ExerciseUpdateSchema,
});

type GranularExerciseUpdateParams = z.infer<typeof granularExerciseUpdateParams>;

export const workoutGranularExerciseUpdateTool: McpTool<GranularExerciseUpdateParams> = {
  name: 'workout_granular_exercise_update',
  description: `Updates exercise-level fields like name, description, notes, form cues, equipment.
  
Use this for:
- Renaming exercises
- Adding form cues or notes
- Updating equipment requirements
- Adding video links`,
  parameters: granularExerciseUpdateParams,
  execute: async (args) => {
    const { program, target, update } = args;
    const normalizedProgram = normalizeWorkoutProgram(program);

    const result = GranularSessionService.updateExercise(normalizedProgram, target, update);

    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }

    return {
      success: true,
      program: result.program,
      message: `Updated Exercise at Week ${target.weekNumber}, Day ${target.dayNumber}, Exercise ${target.exerciseIndex}`,
      modifiedFields: Object.keys(update),
    };
  },
};

// =====================================================
// Tool: Granular Day Update
// =====================================================

const granularDayUpdateParams = z.object({
  program: mcpWorkoutProgramSchema,
  weekNumber: z.number().int().positive(),
  dayNumber: z.number().int().positive(),
  update: DayUpdateSchema,
});

type GranularDayUpdateParams = z.infer<typeof granularDayUpdateParams>;

export const workoutGranularDayUpdateTool: McpTool<GranularDayUpdateParams> = {
  name: 'workout_granular_day_update',
  description: `Updates day-level fields like name, notes, warmup, cooldown, duration.
  
Use this for:
- Renaming workout days
- Adding warmup/cooldown instructions
- Setting target muscles
- Adjusting estimated duration`,
  parameters: granularDayUpdateParams,
  execute: async (args) => {
    const { program, weekNumber, dayNumber, update } = args;
    const normalizedProgram = normalizeWorkoutProgram(program);

    const result = GranularSessionService.updateDay(
      normalizedProgram,
      weekNumber,
      dayNumber,
      update
    );

    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }

    return {
      success: true,
      program: result.program,
      message: `Updated Day ${dayNumber} in Week ${weekNumber}`,
      modifiedFields: Object.keys(update),
    };
  },
};

// =====================================================
// Tool: Granular Week Update
// =====================================================

const granularWeekUpdateParams = z.object({
  program: mcpWorkoutProgramSchema,
  weekNumber: z.number().int().positive(),
  update: WeekUpdateSchema,
});

type GranularWeekUpdateParams = z.infer<typeof granularWeekUpdateParams>;

export const workoutGranularWeekUpdateTool: McpTool<GranularWeekUpdateParams> = {
  name: 'workout_granular_week_update',
  description: `Updates week-level fields like focus and notes.
  
Use this for:
- Setting weekly focus (Volume, Intensity, Deload)
- Adding weekly notes and instructions`,
  parameters: granularWeekUpdateParams,
  execute: async (args) => {
    const { program, weekNumber, update } = args;
    const normalizedProgram = normalizeWorkoutProgram(program);

    const result = GranularSessionService.updateWeek(normalizedProgram, weekNumber, update);

    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }

    return {
      success: true,
      program: result.program,
      message: `Updated Week ${weekNumber}`,
      modifiedFields: Object.keys(update),
    };
  },
};

// =====================================================
// Tool: Batch Granular Update
// =====================================================

const batchUpdateOperationSchema = z.object({
  target: SessionTargetSchema,
  setGroupUpdate: SetGroupUpdateSchema.optional(),
  exerciseUpdate: ExerciseUpdateSchema.optional(),
  dayUpdate: DayUpdateSchema.optional(),
  weekUpdate: WeekUpdateSchema.optional(),
});

const batchGranularUpdateParams = z.object({
  program: mcpWorkoutProgramSchema,
  operations: z
    .array(batchUpdateOperationSchema)
    .min(1)
    .describe('Array of update operations to apply'),
  oneRepMax: z.number().positive().optional(),
});

type BatchGranularUpdateParams = z.infer<typeof batchGranularUpdateParams>;

export const workoutBatchGranularUpdateTool: McpTool<BatchGranularUpdateParams> = {
  name: 'workout_batch_granular_update',
  description: `Applies multiple granular updates in a single atomic operation.
  
Use this for:
- Updating multiple exercises at once
- Applying changes across multiple weeks
- Complex program modifications
- Ensuring all changes succeed or none apply

Example: "Increase weight by 2.5kg for all squat sessions across weeks 2-4"`,
  parameters: batchGranularUpdateParams,
  execute: async (args) => {
    const { program, operations, oneRepMax } = args;
    const normalizedProgram = normalizeWorkoutProgram(program);

    const result = GranularSessionService.batchUpdate(normalizedProgram, operations, oneRepMax);

    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }

    return {
      success: true,
      program: result.program,
      message: `Applied ${operations.length} updates successfully`,
      modifiedTargets: result.modifiedTargets,
    };
  },
};

// =====================================================
// Tool: Add SetGroup
// =====================================================

const addSetGroupParams = z.object({
  program: mcpWorkoutProgramSchema,
  target: SessionTargetSchema,
  setGroup: z
    .object({
      count: z.number().int().positive().optional().default(3),
      baseSet: SetFieldUpdateSchema.optional(),
    })
    .optional(),
});

type AddSetGroupParams = z.infer<typeof addSetGroupParams>;

export const workoutAddSetGroupTool: McpTool<AddSetGroupParams> = {
  name: 'workout_add_setgroup',
  description: `Adds a new SetGroup to an exercise.
  
Use this for:
- Adding drop sets
- Adding backoff sets
- Creating supersets (multiple set groups)`,
  parameters: addSetGroupParams,
  execute: async (args) => {
    const { program, target, setGroup } = args;
    const normalizedProgram = normalizeWorkoutProgram(program);

    // Convert the partial setGroup to the expected format
    const setGroupInput = setGroup
      ? {
          count: setGroup.count,
          baseSet: setGroup.baseSet
            ? {
                reps: setGroup.baseSet.reps,
                repsMax: setGroup.baseSet.repsMax,
                duration: setGroup.baseSet.duration,
                weight: setGroup.baseSet.weight ?? null,
                weightMax: setGroup.baseSet.weightMax ?? null,
                weightLbs: setGroup.baseSet.weightLbs ?? null,
                intensityPercent: setGroup.baseSet.intensityPercent ?? null,
                intensityPercentMax: setGroup.baseSet.intensityPercentMax ?? null,
                rpe: setGroup.baseSet.rpe ?? null,
                rpeMax: setGroup.baseSet.rpeMax ?? null,
                rest: setGroup.baseSet.rest ?? 90,
              }
            : undefined,
        }
      : {};

    const result = GranularSessionService.addSetGroup(normalizedProgram, target, setGroupInput);

    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }

    return {
      success: true,
      program: result.program,
      message: `Added new SetGroup to Exercise ${target.exerciseIndex} at Week ${target.weekNumber}, Day ${target.dayNumber}`,
    };
  },
};

// =====================================================
// Tool: Remove SetGroup
// =====================================================

const removeSetGroupParams = z.object({
  program: mcpWorkoutProgramSchema,
  target: SessionTargetSchema.extend({
    setGroupIndex: z.number().int().nonnegative(),
  }),
});

type RemoveSetGroupParams = z.infer<typeof removeSetGroupParams>;

export const workoutRemoveSetGroupTool: McpTool<RemoveSetGroupParams> = {
  name: 'workout_remove_setgroup',
  description: `Removes a SetGroup from an exercise.
  
Note: Cannot remove the last SetGroup (at least one must remain).`,
  parameters: removeSetGroupParams,
  execute: async (args) => {
    const { program, target } = args;
    const normalizedProgram = normalizeWorkoutProgram(program);

    const result = GranularSessionService.removeSetGroup(normalizedProgram, target);

    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }

    return {
      success: true,
      program: result.program,
      message: `Removed SetGroup ${target.setGroupIndex} from Exercise ${target.exerciseIndex}`,
    };
  },
};

// =====================================================
// Tool: Duplicate SetGroup
// =====================================================

const duplicateSetGroupParams = z.object({
  program: mcpWorkoutProgramSchema,
  target: SessionTargetSchema.extend({
    setGroupIndex: z.number().int().nonnegative(),
  }),
});

type DuplicateSetGroupParams = z.infer<typeof duplicateSetGroupParams>;

export const workoutDuplicateSetGroupTool: McpTool<DuplicateSetGroupParams> = {
  name: 'workout_duplicate_setgroup',
  description: `Duplicates an existing SetGroup within the same exercise.
  
Use this for:
- Creating variations of existing sets
- Building complex set schemes`,
  parameters: duplicateSetGroupParams,
  execute: async (args) => {
    const { program, target } = args;
    const normalizedProgram = normalizeWorkoutProgram(program);

    const result = GranularSessionService.duplicateSetGroup(normalizedProgram, target);

    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }

    return {
      success: true,
      program: result.program,
      message: `Duplicated SetGroup ${target.setGroupIndex} in Exercise ${target.exerciseIndex}`,
    };
  },
};

// =====================================================
// Tool: Copy Progression Pattern
// =====================================================

const copyProgressionPatternParams = z.object({
  program: mcpWorkoutProgramSchema,
  sourceExerciseName: z.string().describe('Name of the exercise to copy pattern from'),
  targetExerciseName: z.string().describe('Name of the exercise to apply pattern to'),
});

type CopyProgressionPatternParams = z.infer<typeof copyProgressionPatternParams>;

export const workoutCopyProgressionPatternTool: McpTool<CopyProgressionPatternParams> = {
  name: 'workout_copy_progression_pattern',
  description: `Copies the progression pattern (set counts) from one exercise to another.
  
Use this for:
- Applying consistent volume patterns
- Synchronizing exercise progressions`,
  parameters: copyProgressionPatternParams,
  execute: async (args) => {
    const { program, sourceExerciseName, targetExerciseName } = args;
    const normalizedProgram = normalizeWorkoutProgram(program);

    const result = GranularSessionService.copyProgressionPattern(
      normalizedProgram,
      sourceExerciseName,
      targetExerciseName
    );

    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }

    return {
      success: true,
      program: result.program,
      message: `Copied progression pattern from "${sourceExerciseName}" to "${targetExerciseName}"`,
    };
  },
};

// =====================================================
// Tool: Persist Program (Save Granular Changes)
// =====================================================

const persistProgramParams = z.object({
  programId: z.string().describe('The ID of the program to persist'),
  program: mcpWorkoutProgramSchema.describe('The modified program object to save'),
});

type PersistProgramParams = z.infer<typeof persistProgramParams>;

export const workoutPersistProgramTool: McpTool<PersistProgramParams> = {
  name: 'workout_persist_program',
  description: `Persists a modified workout program to the database.
  
IMPORTANT: Use this tool AFTER making granular modifications (add_setgroup, 
remove_setgroup, granular_setgroup_update, etc.) to save the changes to the database.

This performs a PATCH operation - it only updates the weeks JSON structure,
preserving all other program metadata.

Workflow:
1. Use workout_get_program to retrieve the program
2. Apply granular modifications (workout_add_setgroup, etc.)
3. Call this tool with the modified program to persist changes`,
  parameters: persistProgramParams,
  execute: async (args) => {
    console.log('[MCP:workout_persist_program] 📥 Called with:', {
      programId: args.programId,
      weeksCount: args.program?.weeks?.length,
    });

    // DEBUG: Log detailed program structure to trace what AI sends
    if (args.program?.weeks) {
      args.program.weeks.forEach((week: any, wIdx: number) => {
        console.log(`[MCP:workout_persist_program] 📊 Week ${wIdx + 1}:`, {
          daysCount: week.days?.length || 0,
          days: week.days?.map((d: any, dIdx: number) => ({
            dayNumber: dIdx + 1,
            exercisesCount: d.exercises?.length || 0,
          })),
        });
      });
    }

    const { programId, program } = args;
    const normalizedProgram = normalizeWorkoutProgram(program);

    // Verify program exists
    const existingProgram = await prisma.workout_programs.findUnique({
      where: { id: programId },
      select: { id: true },
    });

    if (!existingProgram) {
      console.log('[MCP:workout_persist_program] ❌ Program not found:', programId);
      return {
        success: false,
        error: `Program with ID ${programId} not found`,
      };
    }

    // PATCH: Only update the weeks structure, preserve everything else
    await prisma.workout_programs.update({
      where: { id: programId },
      data: {
        weeks: normalizedProgram.weeks as unknown as Prisma.InputJsonValue,
        updatedAt: new Date(),
      },
    });

    console.log('[MCP:workout_persist_program] ✅ Saved successfully:', {
      programId,
      weeksCount: normalizedProgram.weeks.length,
    });

    return {
      success: true,
      programId,
      message: `Program ${programId} saved successfully with ${normalizedProgram.weeks.length} week(s)`,
    };
  },
};

// =====================================================
// Tool: Apply Modification (DIFF-based approach)
// =====================================================

/**
 * Modification action types for workout changes
 */
const ModificationActionSchema = z.enum([
  'update_setgroup',
  'add_setgroup',
  'remove_setgroup',
  'update_exercise',
  'add_exercise',
  'remove_exercise',
]);

/**
 * Target location in the program (can use index or name for fuzzy matching)
 */
const ModificationTargetSchema = z.object({
  weekIndex: z.number().int().min(0).describe('Week index (0-based)'),
  dayIndex: z.number().int().min(0).describe('Day index within the week (0-based)'),
  exerciseIndex: z.number().int().min(0).optional().describe('Exercise index (0-based)'),
  setgroupIndex: z.number().int().min(0).optional().describe('SetGroup index (0-based)'),
  // Alternative: use names for fuzzy matching (more robust)
  exerciseName: z.string().optional().describe('Exercise name for fuzzy matching (e.g. "squat", "panca")'),
});

/**
 * The modification specification - what to change
 */
const applyModificationParams = z.object({
  programId: z.string().describe('The ID of the program to modify'),
  action: ModificationActionSchema.describe('The type of modification to apply'),
  target: ModificationTargetSchema.describe('Where to apply the modification'),
  changes: z.record(z.string(), z.any()).optional().describe('The changes to apply (for update actions)'),
  newData: z.any().optional().describe('New data to add (for add actions)'),
});

type ApplyModificationParams = z.infer<typeof applyModificationParams>;

/**
 * Helper: Find exercise by name (fuzzy matching)
 */
function findExerciseByName(
  program: any,
  weekIndex: number,
  dayIndex: number,
  exerciseName: string
): { exerciseIndex: number; exercise: any } | null {
  const day = program.weeks?.[weekIndex]?.days?.[dayIndex];
  if (!day?.exercises) return null;

  const searchName = exerciseName.toLowerCase().trim();
  const exerciseIndex = day.exercises.findIndex((ex: any) =>
    ex.name?.toLowerCase().includes(searchName) ||
    ex.exerciseName?.toLowerCase().includes(searchName)
  );

  if (exerciseIndex === -1) return null;
  return { exerciseIndex, exercise: day.exercises[exerciseIndex] };
}

export const workoutApplyModificationTool: McpTool<ApplyModificationParams> = {
  name: 'workout_apply_modification',
  description: `Applies a granular modification to a workout program using DIFF-based approach.
  
EFFICIENT: You only specify WHAT to change, not the entire program.
The backend fetches the program, applies your changes, and saves.

SUPPORTED ACTIONS:
- update_setgroup: Update reps, sets, weight, intensity, rest, etc. of a specific setgroup
- add_setgroup: Add a new setgroup to an exercise
- remove_setgroup: Remove a setgroup from an exercise
- update_exercise: Update exercise properties (name, notes, technique)
- add_exercise: Add a new exercise to a day
- remove_exercise: Remove an exercise from a day

TARGETING:
- Use weekIndex/dayIndex/exerciseIndex for precise targeting
- OR use exerciseName for fuzzy matching (e.g. "squat" matches "Squat con bilanciere")

EXAMPLE - Change squat to 5x5 at 80%:
{
  "programId": "abc-123",
  "action": "update_setgroup",
  "target": { "weekIndex": 0, "dayIndex": 0, "exerciseName": "squat", "setgroupIndex": 0 },
  "changes": { "sets": 5, "reps": 5, "intensity": 80 }
}`,
  parameters: applyModificationParams,
  execute: async (args) => {
    console.log('[MCP:workout_apply_modification] 📥 Called with:', {
      programId: args.programId,
      action: args.action,
      target: args.target,
    });

    const { programId, action, target, changes, newData } = args;

    // 1. Fetch current program
    const existingProgram = await prisma.workout_programs.findUnique({
      where: { id: programId },
    });

    if (!existingProgram) {
      return {
        success: false,
        error: `Program with ID ${programId} not found`,
      };
    }

    const weeks = existingProgram.weeks as unknown as any[];
    if (!weeks || weeks.length === 0) {
      return {
        success: false,
        error: 'Program has no weeks',
      };
    }

    // 2. Validate target
    const { weekIndex, dayIndex, exerciseIndex, setgroupIndex, exerciseName } = target;

    if (weekIndex < 0 || weekIndex >= weeks.length) {
      return {
        success: false,
        error: `Invalid weekIndex: ${weekIndex}. Program has ${weeks.length} weeks.`,
      };
    }

    const week = weeks[weekIndex];
    if (dayIndex < 0 || dayIndex >= (week.days?.length || 0)) {
      return {
        success: false,
        error: `Invalid dayIndex: ${dayIndex}. Week ${weekIndex + 1} has ${week.days?.length || 0} days.`,
      };
    }

    const day = week.days[dayIndex];

    // 3. Find exercise (by index or name)
    let targetExerciseIndex = exerciseIndex;
    let targetExercise: any = null;

    if (exerciseName && targetExerciseIndex === undefined) {
      const found = findExerciseByName(existingProgram, weekIndex, dayIndex, exerciseName);
      if (!found) {
        return {
          success: false,
          error: `Exercise "${exerciseName}" not found in Week ${weekIndex + 1}, Day ${dayIndex + 1}`,
        };
      }
      targetExerciseIndex = found.exerciseIndex;
      targetExercise = found.exercise;
    } else if (targetExerciseIndex !== undefined) {
      if (targetExerciseIndex < 0 || targetExerciseIndex >= (day.exercises?.length || 0)) {
        return {
          success: false,
          error: `Invalid exerciseIndex: ${targetExerciseIndex}. Day has ${day.exercises?.length || 0} exercises.`,
        };
      }
      targetExercise = day.exercises[targetExerciseIndex];
    }

    // 4. Apply modification based on action
    let message = '';

    switch (action) {
      case 'update_setgroup': {
        if (targetExercise === null || targetExerciseIndex === undefined) {
          return { success: false, error: 'Exercise target required for update_setgroup' };
        }
        const sgIdx = setgroupIndex ?? 0;
        if (!targetExercise.setGroups || sgIdx >= targetExercise.setGroups.length) {
          return {
            success: false,
            error: `SetGroup index ${sgIdx} not found. Exercise has ${targetExercise.setGroups?.length || 0} setgroups.`,
          };
        }
        // Apply changes to setgroup
        weeks[weekIndex].days[dayIndex].exercises[targetExerciseIndex].setGroups[sgIdx] = {
          ...targetExercise.setGroups[sgIdx],
          ...changes,
        };
        message = `Updated setgroup ${sgIdx} of "${targetExercise.name || 'exercise'}" with: ${JSON.stringify(changes)}`;
        break;
      }

      case 'add_setgroup': {
        if (targetExercise === null || targetExerciseIndex === undefined) {
          return { success: false, error: 'Exercise target required for add_setgroup' };
        }
        if (!weeks[weekIndex].days[dayIndex].exercises[targetExerciseIndex].setGroups) {
          weeks[weekIndex].days[dayIndex].exercises[targetExerciseIndex].setGroups = [];
        }
        const newSetGroup = newData || { sets: 3, reps: 10, intensity: 70 };
        weeks[weekIndex].days[dayIndex].exercises[targetExerciseIndex].setGroups.push(newSetGroup);
        message = `Added setgroup to "${targetExercise.name || 'exercise'}"`;
        break;
      }

      case 'remove_setgroup': {
        if (targetExercise === null || targetExerciseIndex === undefined) {
          return { success: false, error: 'Exercise target required for remove_setgroup' };
        }
        const sgIdx = setgroupIndex ?? 0;
        if (!targetExercise.setGroups || sgIdx >= targetExercise.setGroups.length) {
          return { success: false, error: `SetGroup index ${sgIdx} not found` };
        }
        weeks[weekIndex].days[dayIndex].exercises[targetExerciseIndex].setGroups.splice(sgIdx, 1);
        message = `Removed setgroup ${sgIdx} from "${targetExercise.name || 'exercise'}"`;
        break;
      }

      case 'update_exercise': {
        if (targetExercise === null || targetExerciseIndex === undefined) {
          return { success: false, error: 'Exercise target required for update_exercise' };
        }
        weeks[weekIndex].days[dayIndex].exercises[targetExerciseIndex] = {
          ...targetExercise,
          ...changes,
        };
        message = `Updated exercise "${targetExercise.name || 'exercise'}" with: ${JSON.stringify(changes)}`;
        break;
      }

      case 'add_exercise': {
        if (!newData) {
          return { success: false, error: 'newData required for add_exercise' };
        }
        if (!weeks[weekIndex].days[dayIndex].exercises) {
          weeks[weekIndex].days[dayIndex].exercises = [];
        }
        weeks[weekIndex].days[dayIndex].exercises.push(newData);
        message = `Added exercise "${newData.name || 'new exercise'}" to Week ${weekIndex + 1}, Day ${dayIndex + 1}`;
        break;
      }

      case 'remove_exercise': {
        if (targetExerciseIndex === undefined) {
          return { success: false, error: 'exerciseIndex or exerciseName required for remove_exercise' };
        }
        const removedName = day.exercises[targetExerciseIndex]?.name || 'exercise';
        weeks[weekIndex].days[dayIndex].exercises.splice(targetExerciseIndex, 1);
        message = `Removed exercise "${removedName}" from Week ${weekIndex + 1}, Day ${dayIndex + 1}`;
        break;
      }

      default:
        return { success: false, error: `Unknown action: ${action}` };
    }

    // 5. Save the modified program
    await prisma.workout_programs.update({
      where: { id: programId },
      data: {
        weeks: weeks as unknown as Prisma.InputJsonValue,
        updatedAt: new Date(),
      },
    });

    console.log('[MCP:workout_apply_modification] ✅ Applied:', message);

    return {
      success: true,
      message,
      programId,
    };
  },
};

// =====================================================
// NOTE: I tool sono esportati singolarmente sopra.
// Non creiamo oggetti contenitori per evitare inquinamento
// del namespace MCP. Se serve un array di tool, usare
// l'import * as granularTools from './granular' e filtrare.
// =====================================================

