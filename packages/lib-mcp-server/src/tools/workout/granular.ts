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
import { GranularSessionService } from '@OneCoach/lib-workout';
import { workoutProgramSchema } from '@OneCoach/schemas';
import { normalizeWorkoutProgram } from './program-normalizer';

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
  program: workoutProgramSchema,
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
  program: workoutProgramSchema,
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
  program: workoutProgramSchema,
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
  program: workoutProgramSchema,
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
  program: workoutProgramSchema,
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
  program: workoutProgramSchema,
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
  program: workoutProgramSchema,
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
  program: workoutProgramSchema,
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
  program: workoutProgramSchema,
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
  program: workoutProgramSchema,
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
// NOTE: I tool sono esportati singolarmente sopra.
// Non creiamo oggetti contenitori per evitare inquinamento
// del namespace MCP. Se serve un array di tool, usare
// l'import * as granularTools from './granular' e filtrare.
// =====================================================
