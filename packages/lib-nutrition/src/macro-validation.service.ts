/**
 * Macro Validation Service
 *
 * Centralized service for macro validation and coherence checking.
 */

import {
  calculateCaloriesFromMacros,
  validateMacroCoherence,
  type Macros,
  type MacroCoherenceResult,
} from '@OneCoach/lib-shared';

/**
 * Validation result for Atwater formula
 */
export interface AtwaterValidationResult {
  valid: boolean;
  expectedCalories: number;
  actualCalories: number;
  difference: number;
  differencePercent: number;
  message: string;
}

/**
 * Structure for meal validation
 */
interface MealStructure {
  name: string;
  foods: Macros[];
  expectedMealMacros: Macros;
}

/**
 * Hierarchical validation result for foods → meal → daily
 */
export interface HierarchicalValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  details: {
    foodsToMeal?: MacroCoherenceResult;
    mealsToDaily?: MacroCoherenceResult;
    atwaterChecks?: AtwaterValidationResult[];
  };
}

/**
 * MacroValidationService
 */
export class MacroValidationService {
  static validateAtwaterFormula(macros: Macros, tolerance = 0.05): AtwaterValidationResult {
    const expectedCalories = calculateCaloriesFromMacros(macros.protein, macros.carbs, macros.fats);
    const actualCalories = macros.calories;
    const difference = Math.abs(expectedCalories - actualCalories);
    const differencePercent = expectedCalories > 0 ? difference / expectedCalories : 0;

    const isValid = differencePercent <= tolerance;

    return {
      valid: isValid,
      expectedCalories: Math.round(expectedCalories * 10) / 10,
      actualCalories: Math.round(actualCalories * 10) / 10,
      difference: Math.round(difference * 10) / 10,
      differencePercent: Math.round(differencePercent * 100 * 10) / 10,
      message: isValid
        ? 'Calories are coherent with macros (Atwater formula)'
        : `Calories do not match Atwater formula: expected ${expectedCalories.toFixed(1)}, found ${actualCalories.toFixed(1)} (${(differencePercent * 100).toFixed(1)}% difference)`,
    };
  }

  static validateFoodsToMeal(
    foodMacros: Macros[],
    mealMacros: Macros,
    tolerance = 0.05,
    context = 'meal'
  ): MacroCoherenceResult {
    const summedFoods: Macros = foodMacros.reduce(
      (acc: Macros, food: Macros) => ({
        calories: acc.calories + (food.calories || 0),
        protein: acc.protein + (food.protein || 0),
        carbs: acc.carbs + (food.carbs || 0),
        fats: acc.fats + (food.fats || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );

    return validateMacroCoherence(summedFoods, mealMacros, tolerance, context);
  }

  static validateMealsToTotal(
    mealMacros: Macros[],
    totalMacros: Macros,
    tolerance = 0.05,
    context = 'daily'
  ): MacroCoherenceResult {
    const summedMeals: Macros = mealMacros.reduce(
      (acc: Macros, meal: Macros) => ({
        calories: acc.calories + (meal.calories || 0),
        protein: acc.protein + (meal.protein || 0),
        carbs: acc.carbs + (meal.carbs || 0),
        fats: acc.fats + (meal.fats || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );

    return validateMacroCoherence(summedMeals, totalMacros, tolerance, context);
  }

  static validateMealsToDaily(
    mealMacros: Macros[],
    totalMacros: Macros,
    tolerance = 0.05,
    context = 'daily'
  ): MacroCoherenceResult {
    return this.validateMealsToTotal(mealMacros, totalMacros, tolerance, context);
  }

  static validateHierarchy(
    structure: {
      meals: MealStructure[];
      expectedDailyMacros: Macros;
    },
    tolerance = 0.05
  ): HierarchicalValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const atwaterChecks: AtwaterValidationResult[] = [];

    structure.meals.forEach((meal: MealStructure) => {
      const mealContext = `Meal "${meal.name}"`;

      const atwaterResult = this.validateAtwaterFormula(meal.expectedMealMacros, tolerance);
      atwaterChecks.push(atwaterResult);
      if (!atwaterResult.valid) {
        warnings.push(`${mealContext}: ${atwaterResult.message}`);
      }

      const foodsValidation = this.validateFoodsToMeal(
        meal.foods,
        meal.expectedMealMacros,
        tolerance,
        mealContext
      );

      if (!foodsValidation.valid) {
        errors.push(...foodsValidation.errors);
      }
    });

    const mealMacrosArray = structure.meals.map((m: MealStructure) => m.expectedMealMacros);
    const mealsValidation = this.validateMealsToDaily(
      mealMacrosArray,
      structure.expectedDailyMacros,
      tolerance,
      'Daily totals'
    );

    if (!mealsValidation.valid) {
      errors.push(...mealsValidation.errors);
    }

    const dailyAtwaterResult = this.validateAtwaterFormula(
      structure.expectedDailyMacros,
      tolerance
    );
    atwaterChecks.push(dailyAtwaterResult);
    if (!dailyAtwaterResult.valid) {
      warnings.push(`Daily totals: ${dailyAtwaterResult.message}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      details: {
        mealsToDaily: mealsValidation,
        atwaterChecks,
      },
    };
  }

  static validateAgainstTarget(
    actual: Macros,
    target: Macros,
    tolerance = 0.05,
    context = 'target comparison'
  ): MacroCoherenceResult {
    return validateMacroCoherence(actual, target, tolerance, context);
  }
}
