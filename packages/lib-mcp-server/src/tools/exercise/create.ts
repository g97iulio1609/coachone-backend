/**
 * MCP Exercise Create Tool
 *
 * Crea un nuovo esercizio usando nomi leggibili che vengono automaticamente
 * risolti in ID dal database.
 *
 * DESIGN RATIONALE:
 * - Schema MCP-specifico con descrizioni per guidare l'AI
 * - Risoluzione automatica name → ID per tutti i campi metadata
 * - Validazione completa prima della creazione
 */

import { z } from 'zod';
import type { McpTool, McpContext } from '../../types';
import { exerciseService } from '@onecoach/lib-exercise';
import { MuscleRole } from '@prisma/client';
import {
  validateExerciseTypeByName,
  validateMusclesByName,
  validateBodyPartsByName,
  validateEquipmentByName,
} from '@onecoach/lib-metadata';

/**
 * Schema MCP con descrizioni per l'AI
 *
 * NOTA: Usa nomi leggibili invece di ID.
 * Il sistema risolve automaticamente i nomi in ID.
 */
const mcpExerciseCreateSchema = z.object({
  name: z
    .string()
    .min(1)
    .describe('Exercise name in English (e.g., "Push-up", "Bench Press")'),

  exerciseType: z
    .string()
    .min(1)
    .describe(
      'Exercise type name. Valid values: "compound", "isolation", "plyometric", "stretching", "cardio", "bodyweight", "weighted"'
    ),

  muscles: z
    .array(
      z.object({
        name: z
          .string()
          .min(1)
          .describe(
            'Muscle name in English (e.g., "pectoralis major", "biceps brachii", "quadriceps")'
          ),
        role: z.nativeEnum(MuscleRole).describe('Muscle role: PRIMARY or SECONDARY'),
      })
    )
    .min(1)
    .describe('Target muscles with their roles'),

  bodyParts: z
    .array(z.string().min(1))
    .min(1)
    .describe('Body parts in English (e.g., "chest", "arms", "back", "legs")'),

  equipment: z
    .array(z.string().min(1))
    .optional()
    .describe('Equipment needed in English (e.g., "barbell", "dumbbell", "bodyweight", "cable")'),

  overview: z
    .string()
    .max(16000)
    .optional()
    .describe('Brief exercise description explaining what the exercise is and its benefits'),

  instructions: z
    .array(z.string().min(1).max(2000))
    .optional()
    .describe('Step-by-step execution instructions'),

  exerciseTips: z
    .array(z.string().min(1).max(2000))
    .optional()
    .describe('Tips for proper form and common mistakes to avoid'),

  variations: z
    .array(z.string().min(1).max(2000))
    .optional()
    .describe('Exercise variations and progressions'),

  keywords: z.array(z.string()).optional().describe('Search keywords for the exercise'),

  locale: z.string().default('en').describe('Language for translations (default: "en")'),
});

type McpExerciseCreateInput = z.infer<typeof mcpExerciseCreateSchema>;

export const exerciseCreateTool: McpTool = {
  name: 'exercise_create',
  description: `Creates a new exercise in the database. Requires admin privileges.

IMPORTANT: Use human-readable English names for all metadata fields. The system automatically resolves them to database IDs.

Parameters:
- name: Exercise name (e.g., "Push-up", "Barbell Squat")
- exerciseType: Type name like "compound", "isolation", "plyometric", "stretching", "bodyweight"
- muscles: Array of {name, role} where name is English muscle name (e.g., "pectoralis major") and role is "PRIMARY" or "SECONDARY"
- bodyParts: Array of body part names (e.g., "chest", "arms", "back")
- equipment: Optional array of equipment names (e.g., "barbell", "dumbbell", "bodyweight")
- overview: Brief description of the exercise
- instructions: Step-by-step execution instructions
- exerciseTips: Tips for proper form
- variations: Exercise variations

The tool handles all ID resolution automatically. Do NOT look up or use database IDs directly.

After successful creation, always confirm to the user what was created including the exercise name and target muscles.`,

  parameters: mcpExerciseCreateSchema,

  execute: async (args: McpExerciseCreateInput, context: McpContext) => {
    if (!context.isAdmin) {
      throw new Error('Unauthorized: Admin access required for this operation');
    }

    // Resolve exerciseType name → ID
    const exerciseTypeId = await validateExerciseTypeByName(args.exerciseType);
    if (!exerciseTypeId) {
      throw new Error(
        `Invalid exercise type: "${args.exerciseType}". Use valid types like "compound", "isolation", "plyometric", "stretching", "bodyweight".`
      );
    }

    // Resolve muscle names → IDs
    const muscleNames = args.muscles.map((m) => m.name);
    const muscleIds = await validateMusclesByName(muscleNames);

    if (muscleIds.length !== muscleNames.length) {
      const missingMuscles = muscleNames.filter((_, i) => !muscleIds[i]);
      throw new Error(
        `Some muscles could not be resolved: ${missingMuscles.join(', ')}. Use English muscle names like "pectoralis major", "biceps brachii", "quadriceps".`
      );
    }

    const muscles = args.muscles.map((m, i) => ({
      id: muscleIds[i]!,
      role: m.role,
    }));

    // Resolve body part names → IDs
    const bodyPartIds = await validateBodyPartsByName(args.bodyParts);

    if (bodyPartIds.length !== args.bodyParts.length) {
      const missingBodyParts = args.bodyParts.filter((_, i) => !bodyPartIds[i]);
      throw new Error(
        `Some body parts could not be resolved: ${missingBodyParts.join(', ')}. Use English names like "chest", "arms", "back", "legs".`
      );
    }

    // Resolve equipment names → IDs (optional field)
    let equipmentIds: string[] = [];
    if (args.equipment && args.equipment.length > 0) {
      equipmentIds = await validateEquipmentByName(args.equipment);
    }

    // Build translations array with English as required
    const translations = [
      {
        locale: args.locale || 'en',
        name: args.name,
        description: args.overview,
        searchTerms: args.keywords || [],
      },
    ];

    // Create exercise with resolved IDs
    const exercise = await exerciseService.create(
      {
        exerciseTypeId,
        translations,
        muscles,
        bodyPartIds,
        equipmentIds: equipmentIds.length > 0 ? equipmentIds : undefined,
        overview: args.overview,
        instructions: args.instructions ?? [],
        exerciseTips: args.exerciseTips ?? [],
        variations: args.variations ?? [],
        keywords: args.keywords ?? [],
      },
      {
        userId: context.userId,
        autoApprove: true, // Auto-approve if created by admin
      }
    );

    return exercise;
  },
};
