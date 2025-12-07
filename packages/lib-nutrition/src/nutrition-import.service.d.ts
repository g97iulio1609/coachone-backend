import { z } from 'zod';
import {
  AIParseContext,
  ImportFile,
  ImportOptions,
  ImportProgress,
} from '@OneCoach/lib-import-core';
import { ImportedNutritionPlan } from './helpers/imported-nutrition.schema';
declare const NutritionImportOptionsSchema: z.ZodObject<
  {
    mode: z.ZodDefault<
      z.ZodEnum<{
        auto: 'auto';
        review: 'review';
      }>
    >;
    locale: z.ZodOptional<z.ZodString>;
  },
  z.core.$strip
>;
export type NutritionImportOptions = z.infer<typeof NutritionImportOptionsSchema>;
export type NutritionImportResult = {
  success: boolean;
  planId?: string;
  plan?: unknown;
  parseResult?: ImportedNutritionPlan;
  warnings?: string[];
  errors?: string[];
};
export declare class NutritionImportService {
  private readonly params;
  constructor(params: {
    aiContext: AIParseContext<ImportedNutritionPlan>;
    onProgress?: (progress: ImportProgress) => void;
    context?: {
      requestId?: string;
      userId: string;
    };
  });
  private emit;
  private validateFiles;
  private buildRouter;
  import(
    files: ImportFile[],
    userId: string,
    options?: Partial<ImportOptions>
  ): Promise<NutritionImportResult>;
}
export declare function createNutritionAIContext(): AIParseContext<ImportedNutritionPlan>;
export {};
