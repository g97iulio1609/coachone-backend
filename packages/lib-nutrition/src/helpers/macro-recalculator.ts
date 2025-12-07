/**
 * Macro Recalculator Service
 *
 * Ricalcola automaticamente i macro di un piano nutrizionale quando viene modificato
 * un alimento, mantenendo rispettati i targetMacros del piano.
 */

import type {
  NutritionPlan,
  NutritionDay,
  NutritionWeek,
  Food,
  Meal,
  Macros,
} from '@OneCoach/types';
import { normalizeAgentPayload } from './plan-transform';
import type { ModelTier } from '@onecoach/lib-ai-agents/core/providers/types';
import { createModel } from '@onecoach/lib-ai-agents/utils/model-factory';
import { getModelByTier } from '@onecoach/lib-ai-agents/core/providers/config';
import { NutritionDaySchema } from '@onecoach/lib-ai-agents/schemas/planning-schemas';
import { NUTRITION_PROMPTS } from '@OneCoach/lib-ai';
import { getTemplateString } from '@OneCoach/lib-ai';
import { generateObject } from 'ai';

const NUTRITION_SYSTEM_PROMPT = getTemplateString(NUTRITION_PROMPTS.NUTRITION_AGENT);
const NUTRITION_TOOL_USAGE_PROMPT = getTemplateString(NUTRITION_PROMPTS.NUTRITION_TOOLS);

export interface RecalculateRequest {
  plan: NutritionPlan;
  dayNumber: number;
  modifiedFoodId: string;
  modifiedFood: Food;
  userId: string;
  tier?: ModelTier;
  providerApiKey?: string;
}

export interface RecalculateResult {
  success: boolean;
  plan?: NutritionPlan;
  error?: string;
}

/**
 * Calcola i macro totali per un giorno
 */
function calculateDayMacros(day: NutritionDay): Macros {
  return day.meals.reduce(
    (acc: Macros, meal: Meal): Macros => ({
      calories: acc.calories + meal.totalMacros.calories,
      protein: acc.protein + meal.totalMacros.protein,
      carbs: acc.carbs + meal.totalMacros.carbs,
      fats: acc.fats + meal.totalMacros.fats,
      fiber: (acc.fiber || 0) + (meal.totalMacros.fiber || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 }
  );
}

/**
 * Calcola la differenza tra macro attuali e target
 */
function calculateMacroDifference(current: Macros, target: Macros): Macros {
  return {
    calories: target.calories - current.calories,
    protein: target.protein - current.protein,
    carbs: target.carbs - current.carbs,
    fats: target.fats - current.fats,
    fiber: (target.fiber || 0) - (current.fiber || 0),
  };
}

/**
 * Costruisce il prompt per il ricalcolo macro
 */
function buildRecalculatePrompt(
  plan: NutritionPlan,
  day: NutritionDay,
  modifiedFood: Food,
  macroDifference: Macros
): string {
  const restrictions = plan.restrictions?.length ? plan.restrictions.join(', ') : 'nessuna';
  const preferences = plan.preferences?.length ? plan.preferences.join(', ') : 'nessuna';

  return `You are a nutrition plan macro recalculator. A user has modified a food in their nutrition plan, and you need to adjust the OTHER foods in the same day to maintain the target macros.

IMPORTANT: You MUST keep the modified food EXACTLY as provided. Do NOT modify it.

Current Plan Context:
- Goals: ${plan.goals?.join(', ') || 'N/A'}
- Target Macros (daily): ${plan.targetMacros.calories} kcal, ${plan.targetMacros.protein}g protein, ${plan.targetMacros.carbs}g carbs, ${plan.targetMacros.fats}g fats
- Restrictions: ${restrictions}
- Preferences: ${preferences}

Modified Food (DO NOT CHANGE):
- FoodItemId: ${modifiedFood.foodItemId}
- Name: ${modifiedFood.name || 'N/A'}
- Quantity: ${modifiedFood.quantity}${modifiedFood.unit || 'g'}
- Macros: ${modifiedFood.macros ? `${modifiedFood.macros.calories} kcal, ${modifiedFood.macros.protein}g protein, ${modifiedFood.macros.carbs}g carbs, ${modifiedFood.macros.fats}g fats` : 'N/A'}

Current Day Structure:
${JSON.stringify(day, null, 2)}

Macro Difference to Compensate:
- Calories: ${macroDifference.calories.toFixed(1)} kcal
- Protein: ${macroDifference.protein.toFixed(1)}g
- Carbs: ${macroDifference.carbs.toFixed(1)}g
- Fats: ${macroDifference.fats.toFixed(1)}g

Your task:
1. Keep the modified food EXACTLY as provided (do not change its quantity or macros)
2. Adjust OTHER foods in the day to compensate for the macro difference
3. You can modify quantities of existing foods or add new foods
4. Ensure the final daily totals match the target macros within ±5% tolerance
5. Respect all restrictions and preferences
6. Maintain meal structure and variety

Return the complete day structure with all meals and foods, keeping the modified food unchanged.
`;
}

/**
 * Ricalcola i macro per un giorno dopo la modifica di un alimento
 */
export async function recalculateMacrosForDay(
  request: RecalculateRequest
): Promise<RecalculateResult> {
  try {
    const {
      plan,
      dayNumber,
      modifiedFoodId,
      modifiedFood,
      userId: _userId,
      tier,
      providerApiKey,
    } = request;

    // Trova il giorno da modificare usando helper function (future-proof)
    const { getNutritionPlanDay } =
      await import('@OneCoach/lib-shared/utils/nutrition-plan-helpers');
    const day = getNutritionPlanDay(plan, dayNumber);
    if (!day) {
      return {
        success: false,
        error: `Giorno ${dayNumber} non trovato nel piano`,
      };
    }

    // Calcola macro attuali del giorno (dopo la modifica)
    const currentDayMacros = calculateDayMacros(day);
    const targetMacros = plan.targetMacros;

    // Calcola la differenza da compensare
    const macroDifference = calculateMacroDifference(currentDayMacros, targetMacros);

    // Se la differenza è già entro la tolleranza (±5%), non serve ricalcolo
    const tolerance = 0.05;
    const caloriesDiff = Math.abs(macroDifference.calories) / targetMacros.calories;
    const proteinDiff = Math.abs(macroDifference.protein) / targetMacros.protein;
    const carbsDiff = Math.abs(macroDifference.carbs) / targetMacros.carbs;
    const fatsDiff = Math.abs(macroDifference.fats) / targetMacros.fats;

    if (
      caloriesDiff <= tolerance &&
      proteinDiff <= tolerance &&
      carbsDiff <= tolerance &&
      fatsDiff <= tolerance
    ) {
      return {
        success: true,
        plan,
      };
    }

    // Costruisci il prompt per il ricalcolo
    const prompt = buildRecalculatePrompt(plan, day, modifiedFood, macroDifference);

    // Get model configuration
    const modelConfig = await getModelByTier(tier || 'balanced');
    const apiKey = providerApiKey || process.env.OPENROUTER_API_KEY || '';

    // Create model instance
    const model = createModel(modelConfig, apiKey);

    // Generate recalculated day using generateObject (AI SDK 5+ pattern)
    const { object: recalculatedDayData } = await generateObject({
      model,
      schema: NutritionDaySchema,
      system: `${NUTRITION_SYSTEM_PROMPT}\n\n${NUTRITION_TOOL_USAGE_PROMPT}`,
      prompt,
      experimental_telemetry: {
        isEnabled: true,
        functionId: 'recalculateMacrosForDay',
      },
    });

    // Normalizza il giorno usando normalizeAgentPayload
    // Creiamo un piano temporaneo per normalizzare il giorno (using weeks structure)
    const tempPlan = normalizeAgentPayload(
      {
        weeks: [
          {
            weekNumber: 1,
            days: [recalculatedDayData],
          },
        ],
      },
      { ...plan }
    );
    // Extract day from weeks structure
    const recalculatedDay = tempPlan.weeks[0]?.days?.find(
      (d: NutritionDay) => d.dayNumber === dayNumber
    );

    if (!recalculatedDay) {
      return {
        success: false,
        error: 'Impossibile normalizzare il giorno ricalcolato',
      };
    }

    // Verifica che l'alimento modificato sia ancora presente e invariato
    const recalculatedDayFoods = recalculatedDay.meals.flatMap((m: Meal) => m.foods);
    const modifiedFoodStillPresent = recalculatedDayFoods.find(
      (f: Food) =>
        f.id === modifiedFoodId ||
        (modifiedFood.foodItemId && f.foodItemId === modifiedFood.foodItemId)
    );

    if (!modifiedFoodStillPresent) {
      return {
        success: false,
        error: "L'alimento modificato non è stato trovato nella risposta ricalcolata",
      };
    }

    // Verifica che l'alimento modificato abbia la stessa quantità
    const quantityMatches =
      Math.abs(modifiedFoodStillPresent.quantity - modifiedFood.quantity) < 0.1;
    if (!quantityMatches) {
      return {
        success: false,
        error: "La quantità dell'alimento modificato è stata alterata durante il ricalcolo",
      };
    }

    // Sostituisci il giorno nel piano con quello ricalcolato
    // Update the day in the weeks structure
    const updatedWeeks: NutritionWeek[] = plan.weeks.map((week: NutritionWeek) => ({
      ...week,
      days: week.days.map((d: NutritionDay) => (d.dayNumber === dayNumber ? recalculatedDay : d)),
    }));

    const updatedPlan: NutritionPlan = {
      ...plan,
      weeks: updatedWeeks,
      updatedAt: new Date().toISOString(),
    };

    return {
      success: true,
      plan: updatedPlan,
    };
  } catch (error: unknown) {
    console.error('[MacroRecalculator] Error recalculating macros:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Errore sconosciuto nel ricalcolo',
    };
  }
}
