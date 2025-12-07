import type { McpTool, McpContext } from '../../types';
import { exerciseService } from '@OneCoach/lib-exercise';
import { createExerciseSchema } from '@OneCoach/schemas';

export const exerciseCreateTool: McpTool = {
  name: 'exercise_create',
  description: `Creates a new exercise. Requires admin privileges.
  
  CRITICAL: After this tool executes successfully, you MUST ALWAYS provide a text response to the user explaining what was created. Include the exercise name, target muscles, and confirm it has been added to the database. NEVER end the conversation after calling this tool without providing a human-readable summary.`,
  parameters: createExerciseSchema,
  execute: async (args, context: McpContext) => {
    if (!context.isAdmin) {
      throw new Error('Unauthorized: Admin access required for this operation');
    }

    const exercise = await exerciseService.create(args, {
      userId: context.userId,
      autoApprove: true, // Auto-approve if created by admin
    });
    return exercise;
  },
};
