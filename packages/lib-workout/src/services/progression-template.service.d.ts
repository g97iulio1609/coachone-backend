import type { ProgressionParams } from './workout-progression.service';
export interface ProgressionTemplateData extends ProgressionParams {
  name: string;
  description?: string;
}
export declare class ProgressionTemplateService {
  /**
   * Create a new progression template
   */
  static create(
    userId: string,
    data: ProgressionTemplateData
  ): Promise<{
    name: string;
    id: string;
    userId: string | null;
    updatedAt: Date;
    createdAt: Date;
    description: string | null;
    tags: string[];
    type: import('@prisma/client').$Enums.WorkoutTemplateType;
    category: string | null;
    isPublic: boolean;
    data: import('@prisma/client/runtime/client').JsonValue;
    usageCount: number;
    lastUsedAt: Date | null;
  }>;
  /**
   * List progression templates for a user
   */
  static list(userId: string): Promise<
    {
      id: any;
      name: any;
      description: any;
      params: ProgressionParams;
    }[]
  >;
  /**
   * Delete a progression template
   */
  static delete(
    userId: string,
    templateId: string
  ): Promise<{
    name: string;
    id: string;
    userId: string | null;
    updatedAt: Date;
    createdAt: Date;
    description: string | null;
    tags: string[];
    type: import('@prisma/client').$Enums.WorkoutTemplateType;
    category: string | null;
    isPublic: boolean;
    data: import('@prisma/client/runtime/client').JsonValue;
    usageCount: number;
    lastUsedAt: Date | null;
  }>;
  /**
   * Get a specific template
   */
  static get(
    userId: string,
    templateId: string
  ): Promise<{
    id: string;
    name: string;
    description: string | null;
    params: ProgressionParams;
  } | null>;
}
