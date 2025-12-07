/**
 * MCP Input Schemas
 *
 * Schemi Zod tipizzati per validazione input MCP tools.
 * Questi schemi garantiscono che i dati passati agli MCP tools siano
 * correttamente tipizzati prima del salvataggio nel database.
 *
 * Segue i principi DRY riutilizzando i tipi base da @OneCoach/types
 *
 * @module lib-mcp-server/schemas
 */

import { z } from 'zod';
import {
  MacrosSchema as BaseMacrosSchema,
  CompleteMacrosSchema as BaseCompleteMacrosSchema,
  NutritionUserProfileSchema,
  FoodSchema as BaseFoodSchema,
  MealSchema as BaseMealSchema,
  NutritionDaySchema as BaseNutritionDaySchema,
  NutritionWeekSchema as BaseNutritionWeekSchema,
  exerciseSetSchema,
  setProgressionSchema,
  setGroupSchema,
  exerciseSchema,
  workoutDaySchema,
  workoutWeekSchema,
} from '@OneCoach/schemas';

// ============================================================================
// BASE SCHEMAS
// ============================================================================

export const MacrosSchema = BaseMacrosSchema;
export const CompleteMacrosSchema = BaseCompleteMacrosSchema;

// ============================================================================
// NUTRITION SCHEMAS
// ============================================================================

/**
 * Schema Food per MCP
 */
export const FoodSchema = BaseFoodSchema.extend({
  quantity: z.number().positive(),
  unit: BaseFoodSchema.shape.unit,
  barcode: z.string().optional(),
  brand: z.string().optional(),
  imageUrl: z.string().url().optional(),
  actualQuantity: z.number().positive().optional(),
  actualMacros: MacrosSchema.optional(),
});

/**
 * Schema Meal per MCP
 */
export const MealSchema = BaseMealSchema.extend({
  foods: z.array(FoodSchema),
  totalMacros: MacrosSchema,
});

/**
 * Schema NutritionDay per MCP
 */
export const NutritionDaySchema = BaseNutritionDaySchema.extend({
  meals: z.array(MealSchema),
  totalMacros: MacrosSchema,
  waterIntake: z.number().nonnegative().optional(),
});

/**
 * Schema NutritionWeek per MCP
 */
export const NutritionWeekSchema = BaseNutritionWeekSchema.extend({
  days: z.array(NutritionDaySchema),
  weeklyAverageMacros: MacrosSchema.optional(),
});

/**
 * Schema completo NutritionPlan per input MCP
 * Usato per validare piani generati da AI prima del salvataggio
 */
export const NutritionPlanInputSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().max(1000).optional(),
  goals: z.array(z.string()).min(1),
  durationWeeks: z.number().int().min(1).max(52),
  targetMacros: CompleteMacrosSchema,
  weeks: z.array(NutritionWeekSchema).min(1),
  restrictions: z.array(z.string()).optional().default([]),
  preferences: z.array(z.string()).optional().default([]),
  status: z.enum(['ACTIVE', 'COMPLETED', 'ARCHIVED']).default('ACTIVE'),
  userProfile: NutritionUserProfileSchema.optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// ============================================================================
// WORKOUT SCHEMAS
// ============================================================================

/**
 * Schema ExerciseSet per MCP
 */
export const ExerciseSetSchema = exerciseSetSchema;

/**
 * Schema SetProgression per MCP
 */
export const SetProgressionSchema = setProgressionSchema;

/**
 * Schema SetGroup per MCP
 */
export const SetGroupSchema = setGroupSchema;

/**
 * Schema Exercise per MCP
 */
export const ExerciseSchema = exerciseSchema.extend({
  description: exerciseSchema.shape.description.optional(),
  setGroups: z.array(SetGroupSchema).min(1),
});

/**
 * Schema WorkoutDay per MCP
 */
export const WorkoutDaySchema = workoutDaySchema.extend({
  dayName: workoutDaySchema.shape.dayName.optional(),
  name: workoutDaySchema.shape.name.optional(),
  exercises: z.array(ExerciseSchema),
  targetMuscles: z.array(z.string()),
  notes: z.string().optional(),
  cooldown: z.string().optional(),
});

/**
 * Schema WorkoutWeek per MCP
 */
export const WorkoutWeekSchema = workoutWeekSchema.extend({
  name: z.string().optional(),
  isDeload: z.boolean().default(false),
  days: z.array(WorkoutDaySchema),
});

/**
 * Schema completo WorkoutProgram per input MCP
 * Usato per validare programmi generati da AI prima del salvataggio
 */
export const WorkoutProgramInputSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().max(1000).optional(),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  durationWeeks: z.number().int().min(1).max(52),
  goals: z.array(z.string()).min(1),
  weeks: z.array(WorkoutWeekSchema).min(1),
  status: z.enum(['ACTIVE', 'INACTIVE', 'COMPLETED', 'ARCHIVED']).default('ACTIVE'),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// ============================================================================
// INFERRED TYPES
// ============================================================================

export type NutritionPlanInput = z.infer<typeof NutritionPlanInputSchema>;
export type WorkoutProgramInput = z.infer<typeof WorkoutProgramInputSchema>;
export type FoodInput = z.infer<typeof FoodSchema>;
export type MealInput = z.infer<typeof MealSchema>;
export type NutritionDayInput = z.infer<typeof NutritionDaySchema>;
export type NutritionWeekInput = z.infer<typeof NutritionWeekSchema>;
export type ExerciseInput = z.infer<typeof ExerciseSchema>;
export type WorkoutDayInput = z.infer<typeof WorkoutDaySchema>;
export type WorkoutWeekInput = z.infer<typeof WorkoutWeekSchema>;
export type SetGroupInput = z.infer<typeof SetGroupSchema>;
export type ExerciseSetInput = z.infer<typeof ExerciseSetSchema>;

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Valida un piano nutrizionale prima del salvataggio
 *
 * PRIMA prova con schema AI (più permissivo), POI normalizza con schema strict
 * Questo permette all'AI di essere creativa ma garantisce consistenza finale
 */
export function validateNutritionPlan(data: unknown): {
  success: boolean;
  data?: NutritionPlanInput;
  error?: string;
  warnings?: string[];
} {
  // First try AI schema (more lenient)
  const aiResult = AIOutputNutritionPlanSchema.safeParse(data);
  if (aiResult.success) {
    // Then validate against strict schema (normalize)
    const strictResult = NutritionPlanInputSchema.safeParse(aiResult.data);
    if (strictResult.success) {
      return { success: true, data: strictResult.data };
    }
    // If AI schema passed but strict failed, return helpful error
    return {
      success: false,
      error: `Validazione fallita dopo normalizzazione: ${strictResult.error.message}`,
      warnings: ['Output AI accettato ma richiede normalizzazione'],
    };
  }

  // If AI schema fails, return detailed error
  const errors = aiResult.error.issues
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join('; ');
  return { success: false, error: `Validazione fallita: ${errors}` };
}

/**
 * Valida un programma workout prima del salvataggio
 *
 * PRIMA prova con schema AI (più permissivo), POI normalizza con schema strict
 * Questo permette all'AI di essere creativa ma garantisce consistenza finale
 */
export function validateWorkoutProgram(data: unknown): {
  success: boolean;
  data?: WorkoutProgramInput;
  error?: string;
  warnings?: string[];
} {
  // First try AI schema (more lenient)
  const aiResult = AIOutputWorkoutProgramSchema.safeParse(data);
  if (aiResult.success) {
    // Then validate against strict schema (normalize)
    const strictResult = WorkoutProgramInputSchema.safeParse(aiResult.data);
    if (strictResult.success) {
      return { success: true, data: strictResult.data };
    }
    // If AI schema passed but strict failed, return helpful error
    return {
      success: false,
      error: `Validazione fallita dopo normalizzazione: ${strictResult.error.message}`,
      warnings: ['Output AI accettato ma richiede normalizzazione'],
    };
  }

  // If AI schema fails, return detailed error
  const errors = aiResult.error.issues
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join('; ');
  return { success: false, error: `Validazione fallita: ${errors}` };
}

/**
 * Schema più permissivo per dati AI (con valori opzionali/default)
 * Usato per normalizzare output AI prima della validazione strict
 *
 * PRINCIPIO: L'AI ha autonomia nella strutturazione - questo schema accetta
 * variazioni creative e normalizza solo per sicurezza/consistenza base
 */
export const AIOutputNutritionPlanSchema = NutritionPlanInputSchema.extend({
  // Override some fields to be more lenient for AI output
  weeks: z
    .array(
      NutritionWeekSchema.extend({
        id: z.string().optional(),
        days: z.array(
          NutritionDaySchema.extend({
            id: z.string().optional(),
            meals: z.array(
              MealSchema.extend({
                id: z.string().optional(),
                foods: z.array(
                  FoodSchema.extend({
                    id: z.string().optional(),
                    foodItemId: z.string().optional(),
                    // Allow AI to suggest foods by name if ID not available
                    name: z.string().optional(),
                  })
                ),
                // Allow AI flexibility in meal timing
                time: z.string().optional(),
              })
            ),
            // Allow AI to add custom notes/guidance
            notes: z.string().optional(),
          })
        ),
        // Allow AI to add weekly variations/notes
        notes: z.string().optional(),
      })
    )
    .min(1),
  // Allow AI to suggest alternative macro distributions
  targetMacros: CompleteMacrosSchema.optional(),
  // Allow AI to add metadata about methodology used (for transparency, not enforcement)
  metadata: z
    .record(z.string(), z.unknown())
    .optional()
    .describe(
      'Optional metadata about AI decisions (methodology, calculations, etc.) - for transparency only'
    ),
}).passthrough();

/**
 * Schema più permissivo per dati AI workout (con valori opzionali/default)
 *
 * PRINCIPIO: L'AI ha autonomia nella metodologia - questo schema accetta
 * variazioni creative e normalizza solo per sicurezza/consistenza base
 */
export const AIOutputWorkoutProgramSchema = WorkoutProgramInputSchema.extend({
  // Override some fields to be more lenient for AI output
  weeks: z
    .array(
      WorkoutWeekSchema.extend({
        days: z.array(
          WorkoutDaySchema.extend({
            exercises: z.array(
              ExerciseSchema.extend({
                id: z.string().optional(),
                catalogExerciseId: z.string().optional(),
                // Allow AI to suggest exercises by name if ID not available
                name: z.string().optional(),
                setGroups: z.array(
                  SetGroupSchema.extend({
                    id: z.string().optional(),
                    // Allow AI flexibility in progression strategies
                    progression: SetProgressionSchema.optional(),
                  })
                ),
                // Allow AI to add exercise-specific notes/guidance
                notes: z.string().optional(),
              })
            ),
            // Allow AI to add day-specific notes/guidance
            notes: z.string().optional(),
          })
        ),
        // Allow AI to add weekly notes about periodization
        notes: z.string().optional(),
      })
    )
    .min(1),
  // Allow AI to add metadata about methodology used (for transparency, not enforcement)
  metadata: z
    .record(z.string(), z.unknown())
    .optional()
    .describe(
      'Optional metadata about AI decisions (split type, periodization, progression strategy, etc.) - for transparency only'
    ),
}).passthrough();
