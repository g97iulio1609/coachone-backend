/**
 * Workout Template Service
 *
 * Servizio unificato per gestione template workout (Exercise, Day, Week)
 * Segue principi SOLID: Single Responsibility, Open/Closed, DRY
 */
import type { WorkoutTemplate, WorkoutTemplateType, Exercise, WorkoutDay, WorkoutWeek } from '@OneCoach/types';
interface ListTemplatesOptions {
    type?: WorkoutTemplateType;
    category?: string;
    tags?: string[];
    search?: string;
    limit?: number;
    offset?: number;
    sortBy?: 'createdAt' | 'lastUsedAt' | 'usageCount' | 'name';
    sortOrder?: 'asc' | 'desc';
}
export declare class WorkoutTemplateService {
    /**
     * Crea nuovo template
     */
    static createTemplate(userId: string, data: {
        type: WorkoutTemplateType;
        name: string;
        description?: string;
        category?: string;
        tags?: string[];
        data: Exercise | WorkoutDay | WorkoutWeek;
        isPublic?: boolean;
    }): Promise<WorkoutTemplate>;
    /**
     * Lista template con filtri avanzati
     */
    static listTemplates(userId: string, options?: ListTemplatesOptions): Promise<WorkoutTemplate[]>;
    /**
     * Recupera template per ID
     */
    static getTemplateById(id: string, userId: string): Promise<WorkoutTemplate | null>;
    /**
     * Aggiorna template
     */
    static updateTemplate(id: string, userId: string, data: {
        name?: string;
        description?: string;
        category?: string;
        tags?: string[];
        data?: Exercise | WorkoutDay | WorkoutWeek;
        isPublic?: boolean;
    }): Promise<WorkoutTemplate>;
    /**
     * Elimina template
     */
    static deleteTemplate(id: string, userId: string): Promise<void>;
    /**
     * Incrementa contatore utilizzi
     */
    static incrementUsage(id: string): Promise<void>;
    /**
     * Mappa da Prisma a WorkoutTemplate
     */
    private static mapToWorkoutTemplate;
    /**
     * Ottiene lista categorie disponibili
     */
    static getAvailableCategories(): string[];
}
export {};
