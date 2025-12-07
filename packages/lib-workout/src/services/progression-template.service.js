import { prisma } from '@OneCoach/lib-core/prisma';
import { WorkoutTemplateType } from '@OneCoach/types';
export class ProgressionTemplateService {
  /**
   * Create a new progression template
   */
  static async create(userId, data) {
    const { name, description, ...params } = data;
    return prisma.workout_templates.create({
      data: {
        userId,
        name,
        description,
        type: WorkoutTemplateType.progression,
        data: params, // Store params as JSON
        category: 'progression',
        isPublic: false, // Private by default
      },
    });
  }
  /**
   * List progression templates for a user
   */
  static async list(userId) {
    const templates = await prisma.workout_templates.findMany({
      where: {
        userId,
        type: WorkoutTemplateType.progression,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return templates.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      params: t.data,
    }));
  }
  /**
   * Delete a progression template
   */
  static async delete(userId, templateId) {
    return prisma.workout_templates.delete({
      where: {
        id: templateId,
        userId, // Ensure ownership
      },
    });
  }
  /**
   * Get a specific template
   */
  static async get(userId, templateId) {
    const template = await prisma.workout_templates.findUnique({
      where: {
        id: templateId,
        userId,
      },
    });
    if (!template) return null;
    return {
      id: template.id,
      name: template.name,
      description: template.description,
      params: template.data,
    };
  }
}
