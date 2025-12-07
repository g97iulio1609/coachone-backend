/**
 * Macro Recalculator Service
 *
 * Ricalcola automaticamente i macro di un piano nutrizionale quando viene modificato
 * un alimento, mantenendo rispettati i targetMacros del piano.
 */
import type { NutritionPlan, Food } from '@OneCoach/types';
import type { ModelTier } from '@onecoach/lib-ai-agents/core/providers/types';
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
 * Ricalcola i macro per un giorno dopo la modifica di un alimento
 */
export declare function recalculateMacrosForDay(
  request: RecalculateRequest
): Promise<RecalculateResult>;
