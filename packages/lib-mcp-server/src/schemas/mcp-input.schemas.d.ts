/**
 * MCP Input Schemas
 *
 * Schemi Zod tipizzati per validazione input MCP tools.
 * Questi schemi garantiscono che i dati passati agli MCP tools siano
 * correttamente tipizzati prima del salvataggio nel database.
 *
 * Segue i principi DRY riutilizzando i tipi base da @onecoach/types
 *
 * @module lib-mcp-server/schemas
 */
import { z } from 'zod';
export declare const MacrosSchema: z.ZodObject<{
    calories: z.ZodNumber;
    protein: z.ZodNumber;
    carbs: z.ZodNumber;
    fats: z.ZodNumber;
    fiber: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const CompleteMacrosSchema: z.ZodObject<{
    calories: z.ZodNumber;
    protein: z.ZodNumber;
    carbs: z.ZodNumber;
    fats: z.ZodNumber;
    fiber: z.ZodNumber;
}, z.core.$strip>;
/**
 * Schema Food per MCP
 */
export declare const FoodSchema: z.ZodObject<{
    id: z.ZodString;
    foodItemId: z.ZodString;
    name: z.ZodString;
    macros: z.ZodOptional<z.ZodObject<{
        calories: z.ZodNumber;
        protein: z.ZodNumber;
        carbs: z.ZodNumber;
        fats: z.ZodNumber;
        fiber: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>;
    notes: z.ZodOptional<z.ZodString>;
    done: z.ZodOptional<z.ZodBoolean>;
    quantity: z.ZodNumber;
    unit: z.ZodDefault<z.ZodEnum<{
        g: "g";
        ml: "ml";
    }>>;
    barcode: z.ZodOptional<z.ZodString>;
    brand: z.ZodOptional<z.ZodString>;
    imageUrl: z.ZodOptional<z.ZodString>;
    actualQuantity: z.ZodOptional<z.ZodNumber>;
    actualMacros: z.ZodOptional<z.ZodObject<{
        calories: z.ZodNumber;
        protein: z.ZodNumber;
        carbs: z.ZodNumber;
        fats: z.ZodNumber;
        fiber: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>;
}, z.core.$strip>;
/**
 * Schema Meal per MCP
 */
export declare const MealSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    type: z.ZodEnum<{
        breakfast: "breakfast";
        lunch: "lunch";
        dinner: "dinner";
        snack: "snack";
        "pre-workout": "pre-workout";
        "post-workout": "post-workout";
    }>;
    time: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    foods: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        foodItemId: z.ZodString;
        name: z.ZodString;
        macros: z.ZodOptional<z.ZodObject<{
            calories: z.ZodNumber;
            protein: z.ZodNumber;
            carbs: z.ZodNumber;
            fats: z.ZodNumber;
            fiber: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>;
        notes: z.ZodOptional<z.ZodString>;
        done: z.ZodOptional<z.ZodBoolean>;
        quantity: z.ZodNumber;
        unit: z.ZodDefault<z.ZodEnum<{
            g: "g";
            ml: "ml";
        }>>;
        barcode: z.ZodOptional<z.ZodString>;
        brand: z.ZodOptional<z.ZodString>;
        imageUrl: z.ZodOptional<z.ZodString>;
        actualQuantity: z.ZodOptional<z.ZodNumber>;
        actualMacros: z.ZodOptional<z.ZodObject<{
            calories: z.ZodNumber;
            protein: z.ZodNumber;
            carbs: z.ZodNumber;
            fats: z.ZodNumber;
            fiber: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
    totalMacros: z.ZodObject<{
        calories: z.ZodNumber;
        protein: z.ZodNumber;
        carbs: z.ZodNumber;
        fats: z.ZodNumber;
        fiber: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>;
}, z.core.$strip>;
/**
 * Schema NutritionDay per MCP
 */
export declare const NutritionDaySchema: z.ZodObject<{
    id: z.ZodString;
    dayNumber: z.ZodNumber;
    dayName: z.ZodString;
    notes: z.ZodOptional<z.ZodString>;
    meals: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        type: z.ZodEnum<{
            breakfast: "breakfast";
            lunch: "lunch";
            dinner: "dinner";
            snack: "snack";
            "pre-workout": "pre-workout";
            "post-workout": "post-workout";
        }>;
        time: z.ZodOptional<z.ZodString>;
        notes: z.ZodOptional<z.ZodString>;
        foods: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            foodItemId: z.ZodString;
            name: z.ZodString;
            macros: z.ZodOptional<z.ZodObject<{
                calories: z.ZodNumber;
                protein: z.ZodNumber;
                carbs: z.ZodNumber;
                fats: z.ZodNumber;
                fiber: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>>;
            notes: z.ZodOptional<z.ZodString>;
            done: z.ZodOptional<z.ZodBoolean>;
            quantity: z.ZodNumber;
            unit: z.ZodDefault<z.ZodEnum<{
                g: "g";
                ml: "ml";
            }>>;
            barcode: z.ZodOptional<z.ZodString>;
            brand: z.ZodOptional<z.ZodString>;
            imageUrl: z.ZodOptional<z.ZodString>;
            actualQuantity: z.ZodOptional<z.ZodNumber>;
            actualMacros: z.ZodOptional<z.ZodObject<{
                calories: z.ZodNumber;
                protein: z.ZodNumber;
                carbs: z.ZodNumber;
                fats: z.ZodNumber;
                fiber: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>>;
        }, z.core.$strip>>;
        totalMacros: z.ZodObject<{
            calories: z.ZodNumber;
            protein: z.ZodNumber;
            carbs: z.ZodNumber;
            fats: z.ZodNumber;
            fiber: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>;
    }, z.core.$strip>>;
    totalMacros: z.ZodObject<{
        calories: z.ZodNumber;
        protein: z.ZodNumber;
        carbs: z.ZodNumber;
        fats: z.ZodNumber;
        fiber: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>;
    waterIntake: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
/**
 * Schema NutritionWeek per MCP
 */
export declare const NutritionWeekSchema: z.ZodObject<{
    id: z.ZodString;
    weekNumber: z.ZodNumber;
    notes: z.ZodOptional<z.ZodString>;
    days: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        dayNumber: z.ZodNumber;
        dayName: z.ZodString;
        notes: z.ZodOptional<z.ZodString>;
        meals: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            type: z.ZodEnum<{
                breakfast: "breakfast";
                lunch: "lunch";
                dinner: "dinner";
                snack: "snack";
                "pre-workout": "pre-workout";
                "post-workout": "post-workout";
            }>;
            time: z.ZodOptional<z.ZodString>;
            notes: z.ZodOptional<z.ZodString>;
            foods: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                foodItemId: z.ZodString;
                name: z.ZodString;
                macros: z.ZodOptional<z.ZodObject<{
                    calories: z.ZodNumber;
                    protein: z.ZodNumber;
                    carbs: z.ZodNumber;
                    fats: z.ZodNumber;
                    fiber: z.ZodOptional<z.ZodNumber>;
                }, z.core.$strip>>;
                notes: z.ZodOptional<z.ZodString>;
                done: z.ZodOptional<z.ZodBoolean>;
                quantity: z.ZodNumber;
                unit: z.ZodDefault<z.ZodEnum<{
                    g: "g";
                    ml: "ml";
                }>>;
                barcode: z.ZodOptional<z.ZodString>;
                brand: z.ZodOptional<z.ZodString>;
                imageUrl: z.ZodOptional<z.ZodString>;
                actualQuantity: z.ZodOptional<z.ZodNumber>;
                actualMacros: z.ZodOptional<z.ZodObject<{
                    calories: z.ZodNumber;
                    protein: z.ZodNumber;
                    carbs: z.ZodNumber;
                    fats: z.ZodNumber;
                    fiber: z.ZodOptional<z.ZodNumber>;
                }, z.core.$strip>>;
            }, z.core.$strip>>;
            totalMacros: z.ZodObject<{
                calories: z.ZodNumber;
                protein: z.ZodNumber;
                carbs: z.ZodNumber;
                fats: z.ZodNumber;
                fiber: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>;
        }, z.core.$strip>>;
        totalMacros: z.ZodObject<{
            calories: z.ZodNumber;
            protein: z.ZodNumber;
            carbs: z.ZodNumber;
            fats: z.ZodNumber;
            fiber: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>;
        waterIntake: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>;
    weeklyAverageMacros: z.ZodOptional<z.ZodObject<{
        calories: z.ZodNumber;
        protein: z.ZodNumber;
        carbs: z.ZodNumber;
        fats: z.ZodNumber;
        fiber: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>;
}, z.core.$strip>;
/**
 * Schema completo NutritionPlan per input MCP
 * Usato per validare piani generati da AI prima del salvataggio
 */
export declare const NutritionPlanInputSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    goals: z.ZodArray<z.ZodString>;
    durationWeeks: z.ZodNumber;
    targetMacros: z.ZodObject<{
        calories: z.ZodNumber;
        protein: z.ZodNumber;
        carbs: z.ZodNumber;
        fats: z.ZodNumber;
        fiber: z.ZodNumber;
    }, z.core.$strip>;
    weeks: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        weekNumber: z.ZodNumber;
        notes: z.ZodOptional<z.ZodString>;
        days: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            dayNumber: z.ZodNumber;
            dayName: z.ZodString;
            notes: z.ZodOptional<z.ZodString>;
            meals: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                type: z.ZodEnum<{
                    breakfast: "breakfast";
                    lunch: "lunch";
                    dinner: "dinner";
                    snack: "snack";
                    "pre-workout": "pre-workout";
                    "post-workout": "post-workout";
                }>;
                time: z.ZodOptional<z.ZodString>;
                notes: z.ZodOptional<z.ZodString>;
                foods: z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    foodItemId: z.ZodString;
                    name: z.ZodString;
                    macros: z.ZodOptional<z.ZodObject<{
                        calories: z.ZodNumber;
                        protein: z.ZodNumber;
                        carbs: z.ZodNumber;
                        fats: z.ZodNumber;
                        fiber: z.ZodOptional<z.ZodNumber>;
                    }, z.core.$strip>>;
                    notes: z.ZodOptional<z.ZodString>;
                    done: z.ZodOptional<z.ZodBoolean>;
                    quantity: z.ZodNumber;
                    unit: z.ZodDefault<z.ZodEnum<{
                        g: "g";
                        ml: "ml";
                    }>>;
                    barcode: z.ZodOptional<z.ZodString>;
                    brand: z.ZodOptional<z.ZodString>;
                    imageUrl: z.ZodOptional<z.ZodString>;
                    actualQuantity: z.ZodOptional<z.ZodNumber>;
                    actualMacros: z.ZodOptional<z.ZodObject<{
                        calories: z.ZodNumber;
                        protein: z.ZodNumber;
                        carbs: z.ZodNumber;
                        fats: z.ZodNumber;
                        fiber: z.ZodOptional<z.ZodNumber>;
                    }, z.core.$strip>>;
                }, z.core.$strip>>;
                totalMacros: z.ZodObject<{
                    calories: z.ZodNumber;
                    protein: z.ZodNumber;
                    carbs: z.ZodNumber;
                    fats: z.ZodNumber;
                    fiber: z.ZodOptional<z.ZodNumber>;
                }, z.core.$strip>;
            }, z.core.$strip>>;
            totalMacros: z.ZodObject<{
                calories: z.ZodNumber;
                protein: z.ZodNumber;
                carbs: z.ZodNumber;
                fats: z.ZodNumber;
                fiber: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>;
            waterIntake: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>;
        weeklyAverageMacros: z.ZodOptional<z.ZodObject<{
            calories: z.ZodNumber;
            protein: z.ZodNumber;
            carbs: z.ZodNumber;
            fats: z.ZodNumber;
            fiber: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
    restrictions: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>;
    preferences: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>;
    status: z.ZodDefault<z.ZodEnum<{
        ACTIVE: "ACTIVE";
        COMPLETED: "COMPLETED";
        ARCHIVED: "ARCHIVED";
    }>>;
    userProfile: z.ZodOptional<z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        weight: z.ZodNumber;
        height: z.ZodNumber;
        age: z.ZodNumber;
        gender: z.ZodEnum<{
            other: "other";
            male: "male";
            female: "female";
        }>;
        activityLevel: z.ZodEnum<{
            light: "light";
            active: "active";
            sedentary: "sedentary";
            moderate: "moderate";
            very_active: "very_active";
        }>;
        bodyFatPercentage: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, z.core.$strip>;
/**
 * Schema ExerciseSet per MCP
 */
export declare const ExerciseSetSchema: z.ZodObject<{
    reps: z.ZodOptional<z.ZodNumber>;
    repsMax: z.ZodOptional<z.ZodNumber>;
    duration: z.ZodOptional<z.ZodNumber>;
    weight: z.ZodNullable<z.ZodNumber>;
    weightMax: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    weightLbs: z.ZodNullable<z.ZodNumber>;
    intensityPercent: z.ZodNullable<z.ZodNumber>;
    intensityPercentMax: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    rpe: z.ZodNullable<z.ZodNumber>;
    rpeMax: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    rest: z.ZodNumber;
    done: z.ZodOptional<z.ZodBoolean>;
    repsDone: z.ZodOptional<z.ZodNumber>;
    durationDone: z.ZodOptional<z.ZodNumber>;
    weightDone: z.ZodOptional<z.ZodNumber>;
    weightDoneLbs: z.ZodOptional<z.ZodNumber>;
    notes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Schema SetProgression per MCP
 */
export declare const SetProgressionSchema: z.ZodObject<{
    type: z.ZodEnum<{
        linear: "linear";
        percentage: "percentage";
        rpe: "rpe";
    }>;
    steps: z.ZodArray<z.ZodObject<{
        fromSet: z.ZodNumber;
        toSet: z.ZodNumber;
        adjustment: z.ZodNumber;
    }, z.core.$strip>>;
}, z.core.$strip>;
/**
 * Schema SetGroup per MCP
 */
export declare const SetGroupSchema: z.ZodObject<{
    id: z.ZodString;
    count: z.ZodNumber;
    baseSet: z.ZodObject<{
        reps: z.ZodOptional<z.ZodNumber>;
        repsMax: z.ZodOptional<z.ZodNumber>;
        duration: z.ZodOptional<z.ZodNumber>;
        weight: z.ZodNullable<z.ZodNumber>;
        weightMax: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        weightLbs: z.ZodNullable<z.ZodNumber>;
        intensityPercent: z.ZodNullable<z.ZodNumber>;
        intensityPercentMax: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        rpe: z.ZodNullable<z.ZodNumber>;
        rpeMax: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        rest: z.ZodNumber;
        done: z.ZodOptional<z.ZodBoolean>;
        repsDone: z.ZodOptional<z.ZodNumber>;
        durationDone: z.ZodOptional<z.ZodNumber>;
        weightDone: z.ZodOptional<z.ZodNumber>;
        weightDoneLbs: z.ZodOptional<z.ZodNumber>;
        notes: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    progression: z.ZodOptional<z.ZodObject<{
        type: z.ZodEnum<{
            linear: "linear";
            percentage: "percentage";
            rpe: "rpe";
        }>;
        steps: z.ZodArray<z.ZodObject<{
            fromSet: z.ZodNumber;
            toSet: z.ZodNumber;
            adjustment: z.ZodNumber;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
    sets: z.ZodArray<z.ZodObject<{
        reps: z.ZodOptional<z.ZodNumber>;
        repsMax: z.ZodOptional<z.ZodNumber>;
        duration: z.ZodOptional<z.ZodNumber>;
        weight: z.ZodNullable<z.ZodNumber>;
        weightMax: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        weightLbs: z.ZodNullable<z.ZodNumber>;
        intensityPercent: z.ZodNullable<z.ZodNumber>;
        intensityPercentMax: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        rpe: z.ZodNullable<z.ZodNumber>;
        rpeMax: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        rest: z.ZodNumber;
        done: z.ZodOptional<z.ZodBoolean>;
        repsDone: z.ZodOptional<z.ZodNumber>;
        durationDone: z.ZodOptional<z.ZodNumber>;
        weightDone: z.ZodOptional<z.ZodNumber>;
        weightDoneLbs: z.ZodOptional<z.ZodNumber>;
        notes: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>;
/**
 * Schema Exercise per MCP
 */
export declare const ExerciseSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    exerciseId: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    type: z.ZodEnum<{
        core: "core";
        isolation: "isolation";
        compound: "compound";
        accessory: "accessory";
    }>;
    category: z.ZodEnum<{
        strength: "strength";
        cardio: "cardio";
        flexibility: "flexibility";
        balance: "balance";
        endurance: "endurance";
        core: "core";
    }>;
    muscleGroup: z.ZodOptional<z.ZodString>;
    muscleGroups: z.ZodOptional<z.ZodArray<z.ZodEnum<{
        core: "core";
        chest: "chest";
        back: "back";
        shoulders: "shoulders";
        arms: "arms";
        legs: "legs";
        "full-body": "full-body";
    }>>>;
    reps: z.ZodOptional<z.ZodString>;
    rest: z.ZodOptional<z.ZodString>;
    intensity: z.ZodOptional<z.ZodString>;
    typeLabel: z.ZodOptional<z.ZodString>;
    repRange: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    formCues: z.ZodOptional<z.ZodArray<z.ZodString>>;
    variation: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    equipment: z.ZodOptional<z.ZodArray<z.ZodString>>;
    videoUrl: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    setGroups: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        count: z.ZodNumber;
        baseSet: z.ZodObject<{
            reps: z.ZodOptional<z.ZodNumber>;
            repsMax: z.ZodOptional<z.ZodNumber>;
            duration: z.ZodOptional<z.ZodNumber>;
            weight: z.ZodNullable<z.ZodNumber>;
            weightMax: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            weightLbs: z.ZodNullable<z.ZodNumber>;
            intensityPercent: z.ZodNullable<z.ZodNumber>;
            intensityPercentMax: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            rpe: z.ZodNullable<z.ZodNumber>;
            rpeMax: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            rest: z.ZodNumber;
            done: z.ZodOptional<z.ZodBoolean>;
            repsDone: z.ZodOptional<z.ZodNumber>;
            durationDone: z.ZodOptional<z.ZodNumber>;
            weightDone: z.ZodOptional<z.ZodNumber>;
            weightDoneLbs: z.ZodOptional<z.ZodNumber>;
            notes: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>;
        progression: z.ZodOptional<z.ZodObject<{
            type: z.ZodEnum<{
                linear: "linear";
                percentage: "percentage";
                rpe: "rpe";
            }>;
            steps: z.ZodArray<z.ZodObject<{
                fromSet: z.ZodNumber;
                toSet: z.ZodNumber;
                adjustment: z.ZodNumber;
            }, z.core.$strip>>;
        }, z.core.$strip>>;
        sets: z.ZodArray<z.ZodObject<{
            reps: z.ZodOptional<z.ZodNumber>;
            repsMax: z.ZodOptional<z.ZodNumber>;
            duration: z.ZodOptional<z.ZodNumber>;
            weight: z.ZodNullable<z.ZodNumber>;
            weightMax: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            weightLbs: z.ZodNullable<z.ZodNumber>;
            intensityPercent: z.ZodNullable<z.ZodNumber>;
            intensityPercentMax: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            rpe: z.ZodNullable<z.ZodNumber>;
            rpeMax: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            rest: z.ZodNumber;
            done: z.ZodOptional<z.ZodBoolean>;
            repsDone: z.ZodOptional<z.ZodNumber>;
            durationDone: z.ZodOptional<z.ZodNumber>;
            weightDone: z.ZodOptional<z.ZodNumber>;
            weightDoneLbs: z.ZodOptional<z.ZodNumber>;
            notes: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
/**
 * Schema WorkoutDay per MCP
 */
export declare const WorkoutDaySchema: z.ZodObject<{
    dayNumber: z.ZodNumber;
    totalDuration: z.ZodOptional<z.ZodNumber>;
    warmup: z.ZodOptional<z.ZodString>;
    dayName: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    exercises: z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        exerciseId: z.ZodOptional<z.ZodString>;
        name: z.ZodString;
        type: z.ZodEnum<{
            core: "core";
            isolation: "isolation";
            compound: "compound";
            accessory: "accessory";
        }>;
        category: z.ZodEnum<{
            strength: "strength";
            cardio: "cardio";
            flexibility: "flexibility";
            balance: "balance";
            endurance: "endurance";
            core: "core";
        }>;
        muscleGroup: z.ZodOptional<z.ZodString>;
        muscleGroups: z.ZodOptional<z.ZodArray<z.ZodEnum<{
            core: "core";
            chest: "chest";
            back: "back";
            shoulders: "shoulders";
            arms: "arms";
            legs: "legs";
            "full-body": "full-body";
        }>>>;
        reps: z.ZodOptional<z.ZodString>;
        rest: z.ZodOptional<z.ZodString>;
        intensity: z.ZodOptional<z.ZodString>;
        typeLabel: z.ZodOptional<z.ZodString>;
        repRange: z.ZodOptional<z.ZodString>;
        notes: z.ZodOptional<z.ZodString>;
        formCues: z.ZodOptional<z.ZodArray<z.ZodString>>;
        variation: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        equipment: z.ZodOptional<z.ZodArray<z.ZodString>>;
        videoUrl: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        setGroups: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            count: z.ZodNumber;
            baseSet: z.ZodObject<{
                reps: z.ZodOptional<z.ZodNumber>;
                repsMax: z.ZodOptional<z.ZodNumber>;
                duration: z.ZodOptional<z.ZodNumber>;
                weight: z.ZodNullable<z.ZodNumber>;
                weightMax: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                weightLbs: z.ZodNullable<z.ZodNumber>;
                intensityPercent: z.ZodNullable<z.ZodNumber>;
                intensityPercentMax: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                rpe: z.ZodNullable<z.ZodNumber>;
                rpeMax: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                rest: z.ZodNumber;
                done: z.ZodOptional<z.ZodBoolean>;
                repsDone: z.ZodOptional<z.ZodNumber>;
                durationDone: z.ZodOptional<z.ZodNumber>;
                weightDone: z.ZodOptional<z.ZodNumber>;
                weightDoneLbs: z.ZodOptional<z.ZodNumber>;
                notes: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>;
            progression: z.ZodOptional<z.ZodObject<{
                type: z.ZodEnum<{
                    linear: "linear";
                    percentage: "percentage";
                    rpe: "rpe";
                }>;
                steps: z.ZodArray<z.ZodObject<{
                    fromSet: z.ZodNumber;
                    toSet: z.ZodNumber;
                    adjustment: z.ZodNumber;
                }, z.core.$strip>>;
            }, z.core.$strip>>;
            sets: z.ZodArray<z.ZodObject<{
                reps: z.ZodOptional<z.ZodNumber>;
                repsMax: z.ZodOptional<z.ZodNumber>;
                duration: z.ZodOptional<z.ZodNumber>;
                weight: z.ZodNullable<z.ZodNumber>;
                weightMax: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                weightLbs: z.ZodNullable<z.ZodNumber>;
                intensityPercent: z.ZodNullable<z.ZodNumber>;
                intensityPercentMax: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                rpe: z.ZodNullable<z.ZodNumber>;
                rpeMax: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                rest: z.ZodNumber;
                done: z.ZodOptional<z.ZodBoolean>;
                repsDone: z.ZodOptional<z.ZodNumber>;
                durationDone: z.ZodOptional<z.ZodNumber>;
                weightDone: z.ZodOptional<z.ZodNumber>;
                weightDoneLbs: z.ZodOptional<z.ZodNumber>;
                notes: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>>;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
    targetMuscles: z.ZodArray<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    cooldown: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Schema WorkoutWeek per MCP
 */
export declare const WorkoutWeekSchema: z.ZodObject<{
    weekNumber: z.ZodNumber;
    focus: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    isDeload: z.ZodDefault<z.ZodBoolean>;
    days: z.ZodArray<z.ZodObject<{
        dayNumber: z.ZodNumber;
        totalDuration: z.ZodOptional<z.ZodNumber>;
        warmup: z.ZodOptional<z.ZodString>;
        dayName: z.ZodOptional<z.ZodString>;
        name: z.ZodOptional<z.ZodString>;
        exercises: z.ZodArray<z.ZodObject<{
            id: z.ZodOptional<z.ZodString>;
            exerciseId: z.ZodOptional<z.ZodString>;
            name: z.ZodString;
            type: z.ZodEnum<{
                core: "core";
                isolation: "isolation";
                compound: "compound";
                accessory: "accessory";
            }>;
            category: z.ZodEnum<{
                strength: "strength";
                cardio: "cardio";
                flexibility: "flexibility";
                balance: "balance";
                endurance: "endurance";
                core: "core";
            }>;
            muscleGroup: z.ZodOptional<z.ZodString>;
            muscleGroups: z.ZodOptional<z.ZodArray<z.ZodEnum<{
                core: "core";
                chest: "chest";
                back: "back";
                shoulders: "shoulders";
                arms: "arms";
                legs: "legs";
                "full-body": "full-body";
            }>>>;
            reps: z.ZodOptional<z.ZodString>;
            rest: z.ZodOptional<z.ZodString>;
            intensity: z.ZodOptional<z.ZodString>;
            typeLabel: z.ZodOptional<z.ZodString>;
            repRange: z.ZodOptional<z.ZodString>;
            notes: z.ZodOptional<z.ZodString>;
            formCues: z.ZodOptional<z.ZodArray<z.ZodString>>;
            variation: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            equipment: z.ZodOptional<z.ZodArray<z.ZodString>>;
            videoUrl: z.ZodOptional<z.ZodString>;
            description: z.ZodOptional<z.ZodString>;
            setGroups: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                count: z.ZodNumber;
                baseSet: z.ZodObject<{
                    reps: z.ZodOptional<z.ZodNumber>;
                    repsMax: z.ZodOptional<z.ZodNumber>;
                    duration: z.ZodOptional<z.ZodNumber>;
                    weight: z.ZodNullable<z.ZodNumber>;
                    weightMax: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                    weightLbs: z.ZodNullable<z.ZodNumber>;
                    intensityPercent: z.ZodNullable<z.ZodNumber>;
                    intensityPercentMax: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                    rpe: z.ZodNullable<z.ZodNumber>;
                    rpeMax: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                    rest: z.ZodNumber;
                    done: z.ZodOptional<z.ZodBoolean>;
                    repsDone: z.ZodOptional<z.ZodNumber>;
                    durationDone: z.ZodOptional<z.ZodNumber>;
                    weightDone: z.ZodOptional<z.ZodNumber>;
                    weightDoneLbs: z.ZodOptional<z.ZodNumber>;
                    notes: z.ZodOptional<z.ZodString>;
                }, z.core.$strip>;
                progression: z.ZodOptional<z.ZodObject<{
                    type: z.ZodEnum<{
                        linear: "linear";
                        percentage: "percentage";
                        rpe: "rpe";
                    }>;
                    steps: z.ZodArray<z.ZodObject<{
                        fromSet: z.ZodNumber;
                        toSet: z.ZodNumber;
                        adjustment: z.ZodNumber;
                    }, z.core.$strip>>;
                }, z.core.$strip>>;
                sets: z.ZodArray<z.ZodObject<{
                    reps: z.ZodOptional<z.ZodNumber>;
                    repsMax: z.ZodOptional<z.ZodNumber>;
                    duration: z.ZodOptional<z.ZodNumber>;
                    weight: z.ZodNullable<z.ZodNumber>;
                    weightMax: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                    weightLbs: z.ZodNullable<z.ZodNumber>;
                    intensityPercent: z.ZodNullable<z.ZodNumber>;
                    intensityPercentMax: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                    rpe: z.ZodNullable<z.ZodNumber>;
                    rpeMax: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                    rest: z.ZodNumber;
                    done: z.ZodOptional<z.ZodBoolean>;
                    repsDone: z.ZodOptional<z.ZodNumber>;
                    durationDone: z.ZodOptional<z.ZodNumber>;
                    weightDone: z.ZodOptional<z.ZodNumber>;
                    weightDoneLbs: z.ZodOptional<z.ZodNumber>;
                    notes: z.ZodOptional<z.ZodString>;
                }, z.core.$strip>>;
            }, z.core.$strip>>;
        }, z.core.$strip>>;
        targetMuscles: z.ZodArray<z.ZodString>;
        notes: z.ZodOptional<z.ZodString>;
        cooldown: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>;
/**
 * Schema completo WorkoutProgram per input MCP
 * Usato per validare programmi generati da AI prima del salvataggio
 */
export declare const WorkoutProgramInputSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    difficulty: z.ZodEnum<{
        BEGINNER: "BEGINNER";
        INTERMEDIATE: "INTERMEDIATE";
        ADVANCED: "ADVANCED";
    }>;
    durationWeeks: z.ZodNumber;
    goals: z.ZodArray<z.ZodString>;
    weeks: z.ZodArray<z.ZodObject<{
        weekNumber: z.ZodNumber;
        focus: z.ZodOptional<z.ZodString>;
        notes: z.ZodOptional<z.ZodString>;
        name: z.ZodOptional<z.ZodString>;
        isDeload: z.ZodDefault<z.ZodBoolean>;
        days: z.ZodArray<z.ZodObject<{
            dayNumber: z.ZodNumber;
            totalDuration: z.ZodOptional<z.ZodNumber>;
            warmup: z.ZodOptional<z.ZodString>;
            dayName: z.ZodOptional<z.ZodString>;
            name: z.ZodOptional<z.ZodString>;
            exercises: z.ZodArray<z.ZodObject<{
                id: z.ZodOptional<z.ZodString>;
                exerciseId: z.ZodOptional<z.ZodString>;
                name: z.ZodString;
                type: z.ZodEnum<{
                    core: "core";
                    isolation: "isolation";
                    compound: "compound";
                    accessory: "accessory";
                }>;
                category: z.ZodEnum<{
                    strength: "strength";
                    cardio: "cardio";
                    flexibility: "flexibility";
                    balance: "balance";
                    endurance: "endurance";
                    core: "core";
                }>;
                muscleGroup: z.ZodOptional<z.ZodString>;
                muscleGroups: z.ZodOptional<z.ZodArray<z.ZodEnum<{
                    core: "core";
                    chest: "chest";
                    back: "back";
                    shoulders: "shoulders";
                    arms: "arms";
                    legs: "legs";
                    "full-body": "full-body";
                }>>>;
                reps: z.ZodOptional<z.ZodString>;
                rest: z.ZodOptional<z.ZodString>;
                intensity: z.ZodOptional<z.ZodString>;
                typeLabel: z.ZodOptional<z.ZodString>;
                repRange: z.ZodOptional<z.ZodString>;
                notes: z.ZodOptional<z.ZodString>;
                formCues: z.ZodOptional<z.ZodArray<z.ZodString>>;
                variation: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
                equipment: z.ZodOptional<z.ZodArray<z.ZodString>>;
                videoUrl: z.ZodOptional<z.ZodString>;
                description: z.ZodOptional<z.ZodString>;
                setGroups: z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    count: z.ZodNumber;
                    baseSet: z.ZodObject<{
                        reps: z.ZodOptional<z.ZodNumber>;
                        repsMax: z.ZodOptional<z.ZodNumber>;
                        duration: z.ZodOptional<z.ZodNumber>;
                        weight: z.ZodNullable<z.ZodNumber>;
                        weightMax: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                        weightLbs: z.ZodNullable<z.ZodNumber>;
                        intensityPercent: z.ZodNullable<z.ZodNumber>;
                        intensityPercentMax: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                        rpe: z.ZodNullable<z.ZodNumber>;
                        rpeMax: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                        rest: z.ZodNumber;
                        done: z.ZodOptional<z.ZodBoolean>;
                        repsDone: z.ZodOptional<z.ZodNumber>;
                        durationDone: z.ZodOptional<z.ZodNumber>;
                        weightDone: z.ZodOptional<z.ZodNumber>;
                        weightDoneLbs: z.ZodOptional<z.ZodNumber>;
                        notes: z.ZodOptional<z.ZodString>;
                    }, z.core.$strip>;
                    progression: z.ZodOptional<z.ZodObject<{
                        type: z.ZodEnum<{
                            linear: "linear";
                            percentage: "percentage";
                            rpe: "rpe";
                        }>;
                        steps: z.ZodArray<z.ZodObject<{
                            fromSet: z.ZodNumber;
                            toSet: z.ZodNumber;
                            adjustment: z.ZodNumber;
                        }, z.core.$strip>>;
                    }, z.core.$strip>>;
                    sets: z.ZodArray<z.ZodObject<{
                        reps: z.ZodOptional<z.ZodNumber>;
                        repsMax: z.ZodOptional<z.ZodNumber>;
                        duration: z.ZodOptional<z.ZodNumber>;
                        weight: z.ZodNullable<z.ZodNumber>;
                        weightMax: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                        weightLbs: z.ZodNullable<z.ZodNumber>;
                        intensityPercent: z.ZodNullable<z.ZodNumber>;
                        intensityPercentMax: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                        rpe: z.ZodNullable<z.ZodNumber>;
                        rpeMax: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                        rest: z.ZodNumber;
                        done: z.ZodOptional<z.ZodBoolean>;
                        repsDone: z.ZodOptional<z.ZodNumber>;
                        durationDone: z.ZodOptional<z.ZodNumber>;
                        weightDone: z.ZodOptional<z.ZodNumber>;
                        weightDoneLbs: z.ZodOptional<z.ZodNumber>;
                        notes: z.ZodOptional<z.ZodString>;
                    }, z.core.$strip>>;
                }, z.core.$strip>>;
            }, z.core.$strip>>;
            targetMuscles: z.ZodArray<z.ZodString>;
            notes: z.ZodOptional<z.ZodString>;
            cooldown: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
    status: z.ZodDefault<z.ZodEnum<{
        ACTIVE: "ACTIVE";
        COMPLETED: "COMPLETED";
        ARCHIVED: "ARCHIVED";
        INACTIVE: "INACTIVE";
    }>>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, z.core.$strip>;
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
/**
 * Valida un piano nutrizionale prima del salvataggio
 *
 * PRIMA prova con schema AI (più permissivo), POI normalizza con schema strict
 * Questo permette all'AI di essere creativa ma garantisce consistenza finale
 */
export declare function validateNutritionPlan(data: unknown): {
    success: boolean;
    data?: NutritionPlanInput;
    error?: string;
    warnings?: string[];
};
/**
 * Valida un programma workout prima del salvataggio
 *
 * PRIMA prova con schema AI (più permissivo), POI normalizza con schema strict
 * Questo permette all'AI di essere creativa ma garantisce consistenza finale
 */
export declare function validateWorkoutProgram(data: unknown): {
    success: boolean;
    data?: WorkoutProgramInput;
    error?: string;
    warnings?: string[];
};
/**
 * Schema più permissivo per dati AI (con valori opzionali/default)
 * Usato per normalizzare output AI prima della validazione strict
 *
 * PRINCIPIO: L'AI ha autonomia nella strutturazione - questo schema accetta
 * variazioni creative e normalizza solo per sicurezza/consistenza base
 */
export declare const AIOutputNutritionPlanSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    goals: z.ZodArray<z.ZodString>;
    durationWeeks: z.ZodNumber;
    restrictions: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>;
    preferences: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>;
    status: z.ZodDefault<z.ZodEnum<{
        ACTIVE: "ACTIVE";
        COMPLETED: "COMPLETED";
        ARCHIVED: "ARCHIVED";
    }>>;
    userProfile: z.ZodOptional<z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        weight: z.ZodNumber;
        height: z.ZodNumber;
        age: z.ZodNumber;
        gender: z.ZodEnum<{
            other: "other";
            male: "male";
            female: "female";
        }>;
        activityLevel: z.ZodEnum<{
            light: "light";
            active: "active";
            sedentary: "sedentary";
            moderate: "moderate";
            very_active: "very_active";
        }>;
        bodyFatPercentage: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>;
    weeks: z.ZodArray<z.ZodObject<{
        weekNumber: z.ZodNumber;
        weeklyAverageMacros: z.ZodOptional<z.ZodObject<{
            calories: z.ZodNumber;
            protein: z.ZodNumber;
            carbs: z.ZodNumber;
            fats: z.ZodNumber;
            fiber: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>;
        id: z.ZodOptional<z.ZodString>;
        days: z.ZodArray<z.ZodObject<{
            dayNumber: z.ZodNumber;
            dayName: z.ZodString;
            totalMacros: z.ZodObject<{
                calories: z.ZodNumber;
                protein: z.ZodNumber;
                carbs: z.ZodNumber;
                fats: z.ZodNumber;
                fiber: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>;
            waterIntake: z.ZodOptional<z.ZodNumber>;
            id: z.ZodOptional<z.ZodString>;
            meals: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                type: z.ZodEnum<{
                    breakfast: "breakfast";
                    lunch: "lunch";
                    dinner: "dinner";
                    snack: "snack";
                    "pre-workout": "pre-workout";
                    "post-workout": "post-workout";
                }>;
                notes: z.ZodOptional<z.ZodString>;
                totalMacros: z.ZodObject<{
                    calories: z.ZodNumber;
                    protein: z.ZodNumber;
                    carbs: z.ZodNumber;
                    fats: z.ZodNumber;
                    fiber: z.ZodOptional<z.ZodNumber>;
                }, z.core.$strip>;
                id: z.ZodOptional<z.ZodString>;
                foods: z.ZodArray<z.ZodObject<{
                    macros: z.ZodOptional<z.ZodObject<{
                        calories: z.ZodNumber;
                        protein: z.ZodNumber;
                        carbs: z.ZodNumber;
                        fats: z.ZodNumber;
                        fiber: z.ZodOptional<z.ZodNumber>;
                    }, z.core.$strip>>;
                    notes: z.ZodOptional<z.ZodString>;
                    done: z.ZodOptional<z.ZodBoolean>;
                    quantity: z.ZodNumber;
                    unit: z.ZodDefault<z.ZodEnum<{
                        g: "g";
                        ml: "ml";
                    }>>;
                    barcode: z.ZodOptional<z.ZodString>;
                    brand: z.ZodOptional<z.ZodString>;
                    imageUrl: z.ZodOptional<z.ZodString>;
                    actualQuantity: z.ZodOptional<z.ZodNumber>;
                    actualMacros: z.ZodOptional<z.ZodObject<{
                        calories: z.ZodNumber;
                        protein: z.ZodNumber;
                        carbs: z.ZodNumber;
                        fats: z.ZodNumber;
                        fiber: z.ZodOptional<z.ZodNumber>;
                    }, z.core.$strip>>;
                    id: z.ZodOptional<z.ZodString>;
                    foodItemId: z.ZodOptional<z.ZodString>;
                    name: z.ZodOptional<z.ZodString>;
                }, z.core.$strip>>;
                time: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>>;
            notes: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>;
        notes: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    targetMacros: z.ZodOptional<z.ZodObject<{
        calories: z.ZodNumber;
        protein: z.ZodNumber;
        carbs: z.ZodNumber;
        fats: z.ZodNumber;
        fiber: z.ZodNumber;
    }, z.core.$strip>>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, z.core.$loose>;
/**
 * Schema più permissivo per dati AI workout (con valori opzionali/default)
 *
 * PRINCIPIO: L'AI ha autonomia nella metodologia - questo schema accetta
 * variazioni creative e normalizza solo per sicurezza/consistenza base
 */
export declare const AIOutputWorkoutProgramSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    difficulty: z.ZodEnum<{
        BEGINNER: "BEGINNER";
        INTERMEDIATE: "INTERMEDIATE";
        ADVANCED: "ADVANCED";
    }>;
    durationWeeks: z.ZodNumber;
    goals: z.ZodArray<z.ZodString>;
    status: z.ZodDefault<z.ZodEnum<{
        ACTIVE: "ACTIVE";
        COMPLETED: "COMPLETED";
        ARCHIVED: "ARCHIVED";
        INACTIVE: "INACTIVE";
    }>>;
    weeks: z.ZodArray<z.ZodObject<{
        weekNumber: z.ZodNumber;
        focus: z.ZodOptional<z.ZodString>;
        name: z.ZodOptional<z.ZodString>;
        isDeload: z.ZodDefault<z.ZodBoolean>;
        days: z.ZodArray<z.ZodObject<{
            dayNumber: z.ZodNumber;
            totalDuration: z.ZodOptional<z.ZodNumber>;
            warmup: z.ZodOptional<z.ZodString>;
            dayName: z.ZodOptional<z.ZodString>;
            name: z.ZodOptional<z.ZodString>;
            targetMuscles: z.ZodArray<z.ZodString>;
            cooldown: z.ZodOptional<z.ZodString>;
            exercises: z.ZodArray<z.ZodObject<{
                exerciseId: z.ZodOptional<z.ZodString>;
                type: z.ZodEnum<{
                    core: "core";
                    isolation: "isolation";
                    compound: "compound";
                    accessory: "accessory";
                }>;
                category: z.ZodEnum<{
                    strength: "strength";
                    cardio: "cardio";
                    flexibility: "flexibility";
                    balance: "balance";
                    endurance: "endurance";
                    core: "core";
                }>;
                muscleGroup: z.ZodOptional<z.ZodString>;
                muscleGroups: z.ZodOptional<z.ZodArray<z.ZodEnum<{
                    core: "core";
                    chest: "chest";
                    back: "back";
                    shoulders: "shoulders";
                    arms: "arms";
                    legs: "legs";
                    "full-body": "full-body";
                }>>>;
                reps: z.ZodOptional<z.ZodString>;
                rest: z.ZodOptional<z.ZodString>;
                intensity: z.ZodOptional<z.ZodString>;
                typeLabel: z.ZodOptional<z.ZodString>;
                repRange: z.ZodOptional<z.ZodString>;
                formCues: z.ZodOptional<z.ZodArray<z.ZodString>>;
                variation: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
                equipment: z.ZodOptional<z.ZodArray<z.ZodString>>;
                videoUrl: z.ZodOptional<z.ZodString>;
                description: z.ZodOptional<z.ZodString>;
                id: z.ZodOptional<z.ZodString>;
                catalogExerciseId: z.ZodOptional<z.ZodString>;
                name: z.ZodOptional<z.ZodString>;
                setGroups: z.ZodArray<z.ZodObject<{
                    count: z.ZodNumber;
                    baseSet: z.ZodObject<{
                        reps: z.ZodOptional<z.ZodNumber>;
                        repsMax: z.ZodOptional<z.ZodNumber>;
                        duration: z.ZodOptional<z.ZodNumber>;
                        weight: z.ZodNullable<z.ZodNumber>;
                        weightMax: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                        weightLbs: z.ZodNullable<z.ZodNumber>;
                        intensityPercent: z.ZodNullable<z.ZodNumber>;
                        intensityPercentMax: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                        rpe: z.ZodNullable<z.ZodNumber>;
                        rpeMax: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                        rest: z.ZodNumber;
                        done: z.ZodOptional<z.ZodBoolean>;
                        repsDone: z.ZodOptional<z.ZodNumber>;
                        durationDone: z.ZodOptional<z.ZodNumber>;
                        weightDone: z.ZodOptional<z.ZodNumber>;
                        weightDoneLbs: z.ZodOptional<z.ZodNumber>;
                        notes: z.ZodOptional<z.ZodString>;
                    }, z.core.$strip>;
                    sets: z.ZodArray<z.ZodObject<{
                        reps: z.ZodOptional<z.ZodNumber>;
                        repsMax: z.ZodOptional<z.ZodNumber>;
                        duration: z.ZodOptional<z.ZodNumber>;
                        weight: z.ZodNullable<z.ZodNumber>;
                        weightMax: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                        weightLbs: z.ZodNullable<z.ZodNumber>;
                        intensityPercent: z.ZodNullable<z.ZodNumber>;
                        intensityPercentMax: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                        rpe: z.ZodNullable<z.ZodNumber>;
                        rpeMax: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                        rest: z.ZodNumber;
                        done: z.ZodOptional<z.ZodBoolean>;
                        repsDone: z.ZodOptional<z.ZodNumber>;
                        durationDone: z.ZodOptional<z.ZodNumber>;
                        weightDone: z.ZodOptional<z.ZodNumber>;
                        weightDoneLbs: z.ZodOptional<z.ZodNumber>;
                        notes: z.ZodOptional<z.ZodString>;
                    }, z.core.$strip>>;
                    id: z.ZodOptional<z.ZodString>;
                    progression: z.ZodOptional<z.ZodObject<{
                        type: z.ZodEnum<{
                            linear: "linear";
                            percentage: "percentage";
                            rpe: "rpe";
                        }>;
                        steps: z.ZodArray<z.ZodObject<{
                            fromSet: z.ZodNumber;
                            toSet: z.ZodNumber;
                            adjustment: z.ZodNumber;
                        }, z.core.$strip>>;
                    }, z.core.$strip>>;
                }, z.core.$strip>>;
                notes: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>>;
            notes: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>;
        notes: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, z.core.$loose>;
//# sourceMappingURL=mcp-input.schemas.d.ts.map